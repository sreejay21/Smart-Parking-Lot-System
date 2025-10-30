import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.route";
import parkingRoutes from "./routes/parking.routes";
import { errorHandler } from "./middleware/errorHandler";
import { corsHelper } from "./config/corsHelper"; 
dotenv.config();

const app = express();

// ====== GLOBAL MIDDLEWARES ======
app.use(corsHelper);      
app.use(express.json());

// ====== ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parking", parkingRoutes);

// ====== ERROR HANDLER ======
app.use(errorHandler);

export default app;
