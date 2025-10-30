import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { registerValidation, loginValidation } from "../validator/authValidator";

const router = Router();
const controller = new AuthController();

router.post("/register", registerValidation, controller.register);
router.post("/login", loginValidation, controller.login);

export default router;
