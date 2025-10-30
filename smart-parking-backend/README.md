# Smart Parking Lot System

A simple smart parking lot backend built with Node.js, TypeScript, Express and MongoDB. It supports vehicle check-in/check-out, parking spot management, transactions, and revenue reports.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
	- [Authentication](#authentication)
	- [Admin (Parking Spot Management)](#admin-parking-spot-management)
	- [Parking (Vehicle check-in/out & reports)](#parking-vehicle-check-inout--reports)
- [Models (summary)](#models-summary)
- [Response Format](#response-format)



## Quick Start

1. Install dependencies

```powershell
npm install
```

2. Create a `.env` file in project root (see required env vars below).

3. Run the dev server

```powershell
npm run dev
```

The server listens on `PORT` (default 5000) and connects to the `MONGO_URI` provided.


## Environment Variables

- `PORT` - port to run the server (default: 5000)
- `MONGO_URI` - MongoDB connection string (default used in repo: `mongodb://localhost:27017/smart_parking_oop?replicaSet=rs0`)
- `JWT_SECRET` - secret used to sign JWT tokens (default: `secret` when not provided)


## Available Scripts

- `npm run dev` - run in development with auto-reload
- `npm run build` - compile TypeScript to `dist`
- `npm run start` - run the compiled app
- `npm run seed` - run seeding script
- `npm run test` - run tests (Jest)
- `npm run lint` - run ESLint


## API Endpoints

Base path: `/api`

All responses follow a simple envelope. See the "Response Format" section.

### Authentication

- POST /api/auth/register
	- Description: Register a new user (operator or admin)
	- Request body (JSON):
		- `email` (string, required) - valid email
		- `username` (string, required)
		- `password` (string, required) - min 6 chars
		- `role` (string, optional) - one of `operator`, `admin` (default: `operator`)
	- Validation: `email` must be a valid email, `password` length >= 6, `role` must be `operator` or `admin`.
	- Success response: 201 Created
		```json
		{
			"status": true,
			"responsecode": 201,
			"result": {
				"id": "<userId>",
				"email": "user@example.com",
				"username": "jdoe",
				"role": "operator"
			}
		}
		```

- POST /api/auth/login
	- Description: Login and obtain JWT token
	- Request body (JSON):
		- `email` (string, required)
		- `password` (string, required)
	- Success response: 200 OK
		```json
		{
			"status": true,
			"responsecode": 200,
			"result": {
				"token": "<jwt-token>",
				"role": "operator",
				"email": "user@example.com"
			}
		}
		```

Notes: The token is a standard JWT signed with `JWT_SECRET`. Use it in the `Authorization` header as `Bearer <token>` for protected endpoints (not all routes are currently protected in this codebase).


### Admin (Parking Spot Management)

- POST /api/admin/spot
	- Description: Create a new parking spot
	- Request body (JSON):
		- `code` (string, required) - unique code for the spot
		- `floor` (number, required)
		- `zone` (string, optional)
		- `type` (string, required) - one of `motorcycle`, `car`, `bus`
		- `spotNumber` (number, required)
	- Success response: 201 Created — returns created `ParkingSpot` document
	- Notes: Endpoint adds the newly created spot to Redis available pool.

- PUT /api/admin/spot/:id
	- Description: Update an existing parking spot
	- URL params:
		- `id` - MongoDB ObjectId of ParkingSpot
	- Request body: partial parking spot fields to update (e.g., `isAvailable`, `floor`, `zone`)
	- Success response: 200 OK — updated spot

- GET /api/admin/spots
	- Description: List all parking spots
	- Success response: 200 OK — array of ParkingSpot documents, sorted by `floor` and `spotNumber`.

Notes: Currently admin routes don't enforce authorization in the router; in production add JWT + role checks (see `middleware/roleMiddleware.ts`).


### Parking (Vehicle check-in/out & reports)

- POST /api/parking/checkin
	- Description: Vehicle check-in (assigns an available spot and creates transaction)
	- Request body (JSON):
		- `number` (string, required) - vehicle number (unique)
		- `type` (string, required) - `motorcycle` | `car` | `bus`
		- `owner` (string, optional)
	- Behavior: finds candidate spot sizes based on vehicle type (e.g., `car` can use `car` or `bus` spots depending on availability) and performs a transactional check-in.
	- Success response: 201 Created
		```json
		{
			"status": true,
			"responsecode": 201,
			"result": {
				"transaction": { /* Transaction document */ },
				"spot": { /* Assigned ParkingSpot document */ }
			}
		}
		```

- POST /api/parking/checkout/:number
	- Description: Check-out vehicle by its number (completes transaction and calculates fee)
	- URL params:
		- `number` - vehicle number (string)
	- Success response: 200 OK
		```json
		{
			"status": true,
			"responsecode": 200,
			"result": {
				"transaction": { /* Completed Transaction */ },
				"fee": 123.45
			}
		}
		```
	- Error cases: 400 if no active transaction found for the vehicle.

- GET /api/parking/availability
	- Description: Get available spots grouped by type (redis-backed availability summary)
	- Success: 200 OK — returns grouped availability

- GET /api/parking/transactions
	- Description: Get all transactions (historical)
	- Success: 200 OK — array of transactions

- GET /api/parking/transactions/:id
	- Description: Get single transaction by id
	- URL params: `id` - MongoDB ObjectId
	- Success: 200 OK — transaction object
	- Error: 400 if transaction not found

- GET /api/parking/active
	- Description: Get currently active (ongoing) transactions
	- Success: 200 OK — array of ongoing transactions

- GET /api/parking/revenue
	- Description: Get revenue grouped by date (reporting)
	- Success: 200 OK — revenue summary


## Models (summary)

- User
	- `email` (string), `username` (string), `password` (string, hashed), `role` ("admin"|"operator"|"user")

- Vehicle
	- `number` (string), `type` ("motorcycle"|"car"|"bus"), `owner` (string)

- ParkingSpot
	- `code` (string, unique), `floor` (number), `zone` (string), `type` (motorcycle|car|bus), `isAvailable` (boolean), `spotNumber` (number)

- Transaction
	- `vehicle` (ObjectId), `vehicleNumber` (string), `vehicleType` (enum), `parkingSpot` (ObjectId), `spotCode` (string), `checkIn` (Date), `checkOut` (Date), `fee` (number), `status` (ONGOING|COMPLETED)


## Response Format

All successful responses are wrapped like:

```json
{
	"status": true,
	"responsecode": 200,
	"result": { /* payload */ }
}
```

Errors generally respond with `status: false` and a `responsecode` and `message` or `error` field.


