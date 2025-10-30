import { body } from "express-validator";
import { validateRequest } from "./validation";

// Register validation
export const registerValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("role").isIn(["operator", "admin"]).withMessage("Role must be 'operator' or 'admin'"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateRequest,
];

// Login validation
export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isString().notEmpty().withMessage("Password is required"),
  validateRequest,
];
