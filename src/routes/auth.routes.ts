import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { validateRequest } from "../validator/validation";

const router = Router();
const controller = new AuthController();

router.post("/register", [
  body("username").isString().notEmpty(),
  body("password").isString().isLength({ min: 6 }),
  validateRequest
], controller.register);

router.post("/login", [
  body("username").isString().notEmpty(),
  body("password").isString().notEmpty(),
  validateRequest
], controller.login);

export default router;