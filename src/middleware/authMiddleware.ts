import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "secret";

export function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ status: false, responsecode: 401, error: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send({ status: false, responsecode: 401, error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, SECRET) as any;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).send({ status: false, responsecode: 401, error: "Invalid token" });
  }
}
