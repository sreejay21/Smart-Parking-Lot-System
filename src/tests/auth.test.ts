import request from "supertest";
import app from '../app'
import { User } from '../models/User.model';

describe("AuthController", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        username: "TestUser",
        role: "operator",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.result.email).toBe("test@example.com");

    const user = await User.findOne({ email: "test@example.com" });
    expect(user).toBeTruthy();
  });

  it("should not register duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "duplicate@example.com",
        username: "User1",
        role: "operator",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "duplicate@example.com",
        username: "User2",
        role: "admin",
        password: "password123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Email already exists");
  });

  it("should login successfully", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "login@example.com",
        username: "LoginUser",
        password: "password123",
        role: "operator"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result.token).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fake@example.com",
        password: "wrong"
      });

    expect(res.statusCode).toBe(400);
  });
});
