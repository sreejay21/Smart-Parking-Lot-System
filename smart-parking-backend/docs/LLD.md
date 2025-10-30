# Low-Level Design (LLD) — Smart Parking Lot System

This document captures the low-level design for the Smart Parking Lot System as implemented in this repository. It documents architecture, components, data models, API contracts, concurrency/transactional behavior, Redis usage, database indexes, error handling, tests and operational considerations.

## 1. Project Overview

A RESTful backend to manage parking spots, record vehicle check-ins/check-outs, and produce transaction/revenue reports. Built with:

- Node.js + TypeScript
- Express for HTTP APIs
- Mongoose (MongoDB) for data persistence
- Redis (ioredis) for availability tracking / quick lookups
- JWT for authentication

Key flows:
- Vehicle check-in: select an available spot, create transaction, mark spot unavailable in DB and Redis
- Vehicle check-out: compute fee, mark transaction completed, free spot in DB and Redis


## 2. High-level Components

- app.ts / server.ts – Express app bootstrap and DB connection
- routes/ – HTTP route definitions
  - `auth.routes.ts` — authentication endpoints
  - `admin.route.ts` — admin/spot management endpoints
  - `parking.routes.ts` — checkin/checkout and reports
- controllers/ – controllers implement request handling
  - `AuthController` — register, login
  - `AdminController` — create/update/list spots
  - `ParkingController` — checkIn, checkOut, reports
- repositories/ – encapsulate DB logic and transactions
  - `ParkingRepository` — transactional operations for check-in/out and queries
  - `UserRepository` — user CRUD and password handling
- models/ – Mongoose models (User, Vehicle, ParkingSpot, Transaction)
- utils/
  - `redisClient` — functions to manage Redis availability state
  - `feeCalculator` — compute parking fees
  - `apiResponse` — standardized response envelope
- middleware/
  - `authMiddleware` — (present) JWT check
  - `roleMiddleware` — role-based access (exists but route wiring may be incomplete)
  - `errorHandler` — centralized error response


## 3. Data Models (Mongoose)

### User
- Fields:
  - email: string (unique, required)
  - username: string (required)
  - password: string (hashed, required)
  - role: enum('admin','operator','user') default 'operator'

### Vehicle
- Fields:
  - number: string (required, unique) — vehicle registration/plate
  - type: enum('motorcycle','car','bus')
  - owner: string (optional)

### ParkingSpot
- Fields:
  - code: string (unique, required)
  - floor: number (required)
  - zone: string (default 'A')
  - type: enum('motorcycle','car','bus')
  - isAvailable: boolean (default true)
  - spotNumber: number (required)
- Indexes:
  - compound index: { type: 1, isAvailable: 1, floor: 1, spotNumber: 1 }
    - Purpose: efficient find of available spots by type and sort by floor/spotNumber

### Transaction
- Fields:
  - vehicle: ObjectId (ref Vehicle)
  - vehicleNumber: string
  - vehicleType: enum('motorcycle','car','bus')
  - parkingSpot: ObjectId (ref ParkingSpot)
  - spotCode: string
  - checkIn: Date
  - checkOut: Date (optional)
  - fee: number (optional)
  - status: enum('ONGOING','COMPLETED') default 'ONGOING'


## 4. API Contracts (detailed)

Base: `/api`

Authentication
- POST /api/auth/register
  - Body: { email, username, password, role? }
  - Success: 201 { status:true, responsecode:201, result: { id, email, username, role } }

- POST /api/auth/login
  - Body: { email, password }
  - Success: 200 { status:true, responsecode:200, result: { token, role, email } }
  - Token: JWT signed with `JWT_SECRET`, 8h expiry

Admin (Parking Spot Management)
- POST /api/admin/spot
  - Body: { code, floor, zone?, type, spotNumber }
  - Validation: code, floor, type, spotNumber required
  - Success: 201 created ParkingSpot. Also pushes availability into Redis.

- PUT /api/admin/spot/:id
  - Body: partial fields to update
  - Success: 200 updated ParkingSpot

- GET /api/admin/spots
  - Success: 200 [ParkingSpot]

Parking (Vehicle check-in/out & reports)
- POST /api/parking/checkin
  - Body: { number, type, owner? }
  - Returns: 201 { transaction, spot }
  - Validation note: `type` must be one of enum values; number should be unique for active transactions

- POST /api/parking/checkout/:number
  - Path param: vehicle number
  - Returns: 200 { transaction, fee }
  - Error: 400 if no active transaction

- GET /api/parking/availability
  - Returns grouped available spots (Redis-backed summary)

- GET /api/parking/transactions
  - All transactions

- GET /api/parking/transactions/:id
  - Single transaction or 400 / error if not found

- GET /api/parking/active
  - Currently active transactions

- GET /api/parking/revenue
  - Revenue grouped by date (implementation in repository)

Response envelope (utils/apiResponse):
- success: { status: true, responsecode: <code>, result: <payload> }
- errors: { status: false, responsecode: <code>, message | error }


## 5. Key Flows and Sequence Diagrams

### 5.1 Vehicle Check-in (high level)

1. Client POST /api/parking/checkin { number, type, owner }
2. `ParkingController.checkIn` validates inputs and derives candidate sizes
   - candidate sizes example: for 'car' -> ['car','bus'] (the code does order slice)
3. Controller calls `ParkingRepository.transactionalCheckIn(candidates, null, { number, type, owner })`
   - Repository (conceptually):
     - starts a MongoDB session/transaction
     - checks Redis to find available spot id for first candidate type (or queries DB if needed)
     - reserves spot (atomic set in Redis or mark as unavailable in DB within transaction)
     - creates/links Vehicle (create if not exists)
     - creates Transaction { checkIn: now, status: ONGOING }
     - commits Mongo transaction
     - updates Redis set to remove reserved spot from available list
4. Controller returns 201 with transaction and assigned spot

Sequence (textual):
Client -> ParkingController: POST /checkin
ParkingController -> ParkingRepository: transactionalCheckIn(candidates, ...)
ParkingRepository -> Redis: get available spot
ParkingRepository -> MongoDB (session): mark spot unavailable, create transaction, upsert vehicle
MongoDB -> ParkingRepository: commit
Redis -> ParkingRepository: remove spot from available index
ParkingRepository -> ParkingController: success
ParkingController -> Client: 201 { transaction, spot }

Notes:
- The repository is responsible for handling concurrency; it likely uses MongoDB transactions and Redis operations to keep both in sync.
- Use optimistic or redis-level locks to avoid race conditions when two check-ins try to grab the same spot.


### 5.2 Vehicle Check-out

1. Client POST /api/parking/checkout/:number
2. Controller calls repository.getActiveTransactionByVehicleNumber(number)
3. If not found -> error 400
4. Calculate fee via `feeCalculator` with `vehicleType`, `checkIn`, current date/time
5. Call repository.transactionalCheckOut(transactionId, fee)
   - Repository marks transaction.checkOut and status=COMPLETED and sets fee
   - Marks parking spot `isAvailable=true` in DB
   - Pushes the spot back to Redis available pool
6. Return 200 with updated transaction and fee

Sequence (textual):
Client -> ParkingController: POST /checkout/:number
ParkingController -> ParkingRepository: getActiveTransactionByVehicleNumber(number)
ParkingController -> feeCalculator: calculateFee(...)
ParkingController -> ParkingRepository: transactionalCheckOut(txnId, fee)
ParkingRepository -> MongoDB (session): update transaction, update spot
ParkingRepository -> Redis: add spot to available pool
ParkingRepository -> ParkingController: success
ParkingController -> Client: 200 { transaction, fee }


## 6. Redis Usage and Key Design

Redis is used as fast availability tracking to quickly find available spots without hitting MongoDB every time.

Suggested key patterns used by `redisClient` functions:
- `available:{type}` -> sorted set or list of spot ids (score can be floor*1000 + spotNumber for sorting)
- `spot:{spotId}` -> optional metadata (floor, spotNumber, code) — useful for quick reads

Operations:
- `addAvailableSpot(type, spotId, floor, spotNumber)` — add to set
- `popAvailableSpot(type)` — atomically pop an available spot for that type
- `removeAvailableSpot(type, spotId)` — remove on reservation

Notes/Guarantees:
- Redis operations used to reserve/pop should be atomic (e.g., ZPOPMIN or Lua script) to prevent race conditions.
- The system must ensure Redis and DB stay in sync; use MongoDB transactions and compensate on failures.


## 7. Transactions & Concurrency

- MongoDB transactions should be used in repository methods that modify both `Transaction` and `ParkingSpot` documents together (checkin/checkout).
- Redis reservations should be performed in an atomic manner. Typical pattern:
  1. Attempt atomic pop from Redis to get candidate spot id
  2. Start Mongo transaction
  3. Verify spot still available in DB, update `isAvailable=false`, create transaction
  4. Commit transaction
  5. If any step fails, revert/return spot back to Redis

- Fallback: If Redis is unavailable, repository should gracefully fallback to DB queries (findOne and update) with Mongo transaction and a server-side lock or an update-if-available (findOneAndUpdate with isAvailable:true -> set false) to avoid races.


## 8. Database Indexing and Performance

- ParkingSpot index: { type: 1, isAvailable: 1, floor: 1, spotNumber: 1 }
  - Enables efficient queries for available spots of a given `type` and ordering by floor/spotNumber.
- Consider adding indexes:
  - Transaction: { vehicleNumber: 1, status: 1 } to quickly find active transaction for a vehicle
  - Transaction: { checkIn: 1 } or { checkOut: 1 } for reporting queries
- For large scale, shard by parking lot/zone or separate collections per parking location.


## 9. Error Handling

- Centralized `errorHandler` middleware returns HTTP 500 and logs errors.
- Controllers use `APIResp.getErrorResult` for expected error conditions (validation, not found)
- Validation errors are handled by `express-validator` middleware and `validateRequest`

Recommendations:
- Add structured logging (winston/pino) with correlation IDs
- Create retry/compensation logic for partial failures between DB and Redis


## 10. Security & Auth

- Authentication: JWT tokens via `/api/auth/login` signed with `JWT_SECRET`. Token payload: { id, email, role }
- Authorization: `roleMiddleware` exists — enforce `admin` role for admin endpoints. Currently routing may not wire middleware; update routes to require auth+role.
- Protect endpoints: add `authMiddleware` to parking admin endpoints (create/update spot) and checks that operator/admin roles are allowed.
- Passwords hashed via bcrypt in `UserRepository` (check implementation)
- Best practices: rotate JWT secret, use HTTPS, set JWT expiry and refresh if necessary.


## 11. Testing

- Project uses Jest + mongodb-memory-server for tests (see package.json and `src/tests`)
- Test strategies:
  - Unit tests for `feeCalculator`, `helper` utils
  - Integration tests for controllers using `supertest` and in-memory MongoDB
  - Mock Redis or use a test Redis instance (or use a lightweight Redis mock in tests)
  - Tests for concurrency: simulate multiple concurrent check-ins to ensure repository correctly prevents double-assignment


## 12. Deployment & Ops

- Environment:
  - Node 18+ recommended
  - MongoDB replica set (transactions require replica set)
  - Redis for availability pool
- Env vars: `PORT`, `MONGO_URI`, `JWT_SECRET`
- Start commands: `npm run build && npm run start` or `npm run dev` for development
- Monitoring: add metrics for active transactions, occupancy, revenue per hour; add health endpoints for Mongo and Redis connectivity


## 13. Observability

- Track metrics:
  - current occupancy per type
  - check-ins per minute
  - average fee per vehicle type
- Expose /metrics (Prometheus) or integrate with existing APM
- Log format: JSON with timestamp, level, correlationId, route, handler, elapsedTime


## 14. Known Gaps & Next Steps

- Ensure admin and critical routes are protected with `authMiddleware` + `roleMiddleware`.
- Add request validation for `/parking/checkin` and `/parking/checkout/:number`.
- Implement or verify `ParkingRepository` transactional code uses MongoDB sessions + atomic Redis operations (Lua or ZPOPMIN) to avoid races.
- Add OpenAPI/Swagger documentation and example curl snippets in README.
- Add integration tests for check-in and check-out including Redis interactions.
- Add a small health-check endpoint and graceful shutdown logic that drains DB/Redis connections.


## 15. Appendix — Example Sequence (check-in)

Example request body:
```json
{
  "number": "KA01AB1234",
  "type": "car",
  "owner": "John Doe"
}
```

Example success response:
```json
{
  "status": true,
  "responsecode": 201,
  "result": {
    "transaction": {
      "_id": "...",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "car",
      "parkingSpot": "...",
      "spotCode": "C-101",
      "checkIn": "2025-10-30T09:00:00.000Z",
      "status": "ONGOING"
    },
    "spot": {
      "_id": "...",
      "code": "C-101",
      "type": "car",
      "floor": 1,
      "spotNumber": 101,
      "isAvailable": false
    }
  }
}
```

