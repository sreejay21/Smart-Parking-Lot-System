import { Router } from "express";
import { AdminController } from "../controllers/AdminController";

const router = Router();
const adminController = new AdminController();

router.post("/spot", adminController.createSpot);
router.put("/spot/:id", adminController.updateSpot);
router.get("/spots", adminController.listSpots);

export default router;
