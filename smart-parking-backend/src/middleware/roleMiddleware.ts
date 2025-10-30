import { Request, Response, NextFunction } from "express";

export function roleMiddleware(allowed: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).send({ status: false, responsecode: 401, error: "Unauthorized" });
    if (!allowed.includes(req.user.role)) return res.status(403).send({ status: false, responsecode: 403, error: "Forbidden" });
    next();
  };
}