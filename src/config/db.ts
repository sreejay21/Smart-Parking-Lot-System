import mongoose from "mongoose";

export async function connectDB(mongoUri: string) {
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");
}
