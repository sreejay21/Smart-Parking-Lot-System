import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db"; 
import { ParkingSpot } from "../models/ParkingSpot.model";
import { User } from "../models/User.model";
import { redisClient } from "../utils/redisClient";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart_parking_oop?replicaSet=rs0";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Mongo connected for seeding");

  // clear
  await ParkingSpot.deleteMany({});
  await User.deleteMany({});
  await redisClient.clearAllSpotKeys();

  // create admin
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  await User.create({ username: "admin", password: await require("bcrypt").hash(adminPassword, 10), role: "admin" });
  console.log("Admin user created: admin /", adminPassword);

  // seed parking spots
  const docs: any[] = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 6; i++) docs.push({ code: `F${floor}-M${i}`, floor, zone: "A", type: "motorcycle", isAvailable: true, spotNumber: i });
    for (let i = 1; i <= 12; i++) docs.push({ code: `F${floor}-C${i}`, floor, zone: "B", type: "car", isAvailable: true, spotNumber: i + 100 });
    for (let i = 1; i <= 3; i++) docs.push({ code: `F${floor}-B${i}`, floor, zone: "C", type: "bus", isAvailable: true, spotNumber: i + 200 });
  }

  const inserted = await ParkingSpot.insertMany(docs);
  console.log("Inserted spots:", inserted.length);

  for (const s of inserted) {
    await redisClient.addAvailableSpot(s.type, s._id.toString(), s.floor, s.spotNumber);
  }
  console.log("Redis seeded with available spots");

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
