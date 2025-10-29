import request from "supertest";
import app from "../app";
import { ParkingSpot } from "../models/ParkingSpot.model";

describe("ParkingController", () => {
  it("should create a parking spot", async () => {
    const res = await request(app)
      .post("/api/parking/spots")
      .send({
        code: "A1",
        floor: 1,
        zone: "A",
        type: "car",
        spotNumber: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.code).toBe("A1");
  });

  it("should not create a duplicate parking spot", async () => {
    await ParkingSpot.create({ code: "B1", floor: 1, type: "car", spotNumber: 2 });

    const res = await request(app)
      .post("/api/parking/spots")
      .send({
        code: "B1",
        floor: 1,
        type: "car",
        spotNumber: 2
      });

    expect(res.statusCode).toBe(400);
  });

  it("should check in a vehicle", async () => {
    await ParkingSpot.create({ code: "C1", floor: 1, type: "car", spotNumber: 3, isAvailable: true });

    const res = await request(app)
      .post("/api/parking/checkin")
      .send({
        number: "KL07AB1234",
        type: "car",
        owner: "Sreejay"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.transaction.status).toBe("ONGOING");
  });

  it("should check out a vehicle", async () => {
    await ParkingSpot.create({ code: "D1", floor: 1, type: "car", spotNumber: 4, isAvailable: true });

    const checkinRes = await request(app)
      .post("/api/parking/checkin")
      .send({
        number: "KL07AB4321",
        type: "car",
        owner: "Sreejay"
      });

    const res = await request(app)
      .post(`/api/parking/checkout/KL07AB4321`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.transaction.status).toBe("COMPLETED");
  });
});
