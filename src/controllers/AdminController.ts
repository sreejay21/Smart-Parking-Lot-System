import { Request, Response, NextFunction } from "express";
import { ParkingSpot } from "../models/ParkingSpot.model";
import { APIResp } from "../utils/apiResponse";
import { helper } from "../utils/helper";
import { redisClient } from "../utils/redisClient";

export class AdminController {
  createSpot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputs = helper.getReqValues(req);
      const { code, floor, zone, type, spotNumber } = inputs;
      const spot = await ParkingSpot.create({ code, floor, zone, type, spotNumber, isAvailable: true });
      // add to redis
      await redisClient.addAvailableSpot(type, spot._id.toString(), spot.floor, spot.spotNumber);
      APIResp.successCreate(spot, res);
    } catch (err) {
      next(err);
    }
  };

  listSpots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const spots = await ParkingSpot.find().sort({ floor: 1, spotNumber: 1 });
      APIResp.Ok(spots, res);
    } catch (err) {
      next(err);
    }
  };
}
