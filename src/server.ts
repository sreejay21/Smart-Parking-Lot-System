import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart_parking_oop?replicaSet=rs0";

async function start() {
  try {
    await connectDB(MONGO_URI);
    // ensure redis connects
    // redisClient constructed already
    app.listen(PORT, () => console.log(`Smart Parking server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
