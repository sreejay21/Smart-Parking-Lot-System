import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../app";
import { ParkingSpot } from "../models/ParkingSpot.model";

let mongo: MongoMemoryReplSet;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongo = await MongoMemoryReplSet.create({
    replSet: { storageEngine: "wiredTiger" },
  });

  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("ParkingController", () => {
  it("should check in a vehicle successfully", async () => {
    await ParkingSpot.create({
      code: "C1",
      floor: 1,
      type: "car",
      spotNumber: 1,
      isAvailable: true,
    });

    const res = await request(app)
      .post("/api/parking/checkin")
      .send({ number: "KL07AB1234", type: "car", owner: "Sreejay" });

    expect(res.statusCode).toBe(201);
    expect(res.body.result.transaction.status).toBe("ONGOING");
  });

  it("should return 400 when no available spots", async () => {
    const res = await request(app)
      .post("/api/parking/checkin")
      .send({ number: "KL07CD5678", type: "car", owner: "Mayur" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("No available spot");
  });

  it("should check out a vehicle successfully", async () => {
    await ParkingSpot.create({
      code: "C2",
      floor: 1,
      type: "car",
      spotNumber: 2,
      isAvailable: true,
    });

    await request(app)
      .post("/api/parking/checkin")
      .send({ number: "KL07EF0001", type: "car", owner: "Sreejay" });

    const res = await request(app).post("/api/parking/checkout/KL07EF0001");

    expect(res.statusCode).toBe(200);
    expect(res.body.result.transaction.status).toBe("COMPLETED");
  });

  it("should return grouped available spots", async () => {
    await ParkingSpot.create({
      code: "D1",
      floor: 1,
      type: "car",
      spotNumber: 4,
      isAvailable: true,
    });

    const res = await request(app).get("/api/parking/availability");
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBeDefined();
  });
});
