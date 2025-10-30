import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { APIResp } from "../utils/apiResponse";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return APIResp.getValidationError(res, errors.array());
  next();
};
