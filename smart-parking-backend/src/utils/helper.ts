import { Request } from "express";
export const helper = {
  getReqValues: (req: Request) => ({ ...req.query, ...req.params, ...req.body })
};
