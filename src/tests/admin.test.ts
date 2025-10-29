import request from "supertest";
import app from "../app";
import { ParkingSpot } from "../models/ParkingSpot.model";

describe("AdminController", () => {
  it("should create a new parking spot", async () => {
    const res = await request(app)
      .post("/api/admin/spots")
      .send({
        code: "Z1",
        floor: 1,
        zone: "Z",
        type: "car",
        spotNumber: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.code).toBe("Z1");
  });

  it("should list all parking spots", async () => {
    await ParkingSpot.create({ code: "Y1", floor: 2, type: "bus", spotNumber: 11 });
    const res = await request(app).get("/api/admin/spots");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
