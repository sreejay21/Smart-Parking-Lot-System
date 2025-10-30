import { body, param } from "express-validator";
import { validateRequest } from "./validation";

export const createParkingSpotValidation = [
  body("code").isString().notEmpty().withMessage("Code is required"),
  body("floor").isNumeric().withMessage("Floor must be a number"),
  body("zone").optional().isString(),
  body("type").isIn(["motorcycle", "car", "bus"]).withMessage("Invalid type"),
  body("spotNumber").isNumeric().withMessage("Spot number must be numeric"),
  validateRequest,
];

export const updateParkingSpotValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  body("code").optional().isString(),
  body("floor").optional().isNumeric(),
  body("zone").optional().isString(),
  body("type").optional().isIn(["motorcycle", "car", "bus"]),
  body("isAvailable").optional().isBoolean(),
  body("spotNumber").optional().isNumeric(),
  validateRequest,
];
