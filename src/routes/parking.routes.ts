import { Router } from "express";
import { ParkingController } from "../controllers/ParkingController";

const router = Router();
const controller = new ParkingController();

router.post("/checkin", controller.checkIn);
router.post("/checkout/:number", controller.checkOutByVehicleNumber);
router.get("/availability", controller.getAvailability);
router.get("/transactions", controller.getAllTransactions);
router.get("/transactions/:id", controller.getTransactionById);
router.get("/active", controller.getActiveTransactions);
router.get("/revenue", controller.getRevenueByDate);

export default router;
