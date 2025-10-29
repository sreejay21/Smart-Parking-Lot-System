import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import adminRoutes  from './routes/admin.route';
import parkingRoutes from "./routes/parking.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parking", parkingRoutes);
app.use(errorHandler);
export default app;