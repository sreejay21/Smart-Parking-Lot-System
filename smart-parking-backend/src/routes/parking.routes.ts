import { Router } from "express";
import { ParkingController } from "../controllers/ParkingController";
import {
  createParkingSpotValidation,
  updateParkingSpotValidation,
} from "../validator/parkingValidator";

const router = Router();
const controller = new ParkingController();

// Vehicle check-in/out
router.post("/checkin", controller.checkIn);
router.post("/checkout/:number", controller.checkOut);


// // Parking spot management
// router.post("/spot", createParkingSpotValidation, controller.createParkingSpot);
// router.put("/spot/:id", updateParkingSpotValidation, controller.updateParkingSpot);

// Transaction and reports
router.get("/availability", controller.getAvailability);
router.get("/transactions", controller.getAllTransactions);
router.get("/transactions/:id", controller.getTransactionById);
router.get("/active", controller.getActiveTransactions);
router.get("/revenue", controller.getRevenueByDate);

export default router;
