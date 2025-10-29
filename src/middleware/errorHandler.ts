import { Request, Response, NextFunction } from "express";
import { APIResp } from "../utils/apiResponse";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err && err.stack ? err.stack : err);
  APIResp.internalServerError(res, err && err.message ? err.message : "Internal server error");
}
