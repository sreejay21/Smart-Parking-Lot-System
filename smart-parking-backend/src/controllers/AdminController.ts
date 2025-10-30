import { Request, Response, NextFunction } from "express";
import { ParkingSpot } from "../models/ParkingSpot.model";
import { APIResp } from "../utils/apiResponse";
import { helper } from "../utils/helper";
import { redisClient } from "../utils/redisClient";

export class AdminController {
  // ====== CREATE SPOT ======
  createSpot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputs = helper.getReqValues(req);
      const { code, floor, zone, type, spotNumber } = inputs;

      if (!code || !floor || !type || !spotNumber) {
        return APIResp.getErrorResult("code, floor, type and spotNumber are required", res);
      }

      const existing = await ParkingSpot.findOne({ code });
      if (existing) return APIResp.getErrorResult("Spot with this code already exists", res);

      const spot = await ParkingSpot.create({
        code,
        floor,
        zone,
        type,
        spotNumber,
        isAvailable: true,
      });

      // add to redis
      await redisClient.addAvailableSpot(type, spot._id.toString(), spot.floor, spot.spotNumber);

      APIResp.successCreate(spot, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== UPDATE SPOT ======
  updateSpot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const update = req.body;

      const spot = await ParkingSpot.findByIdAndUpdate(id, update, { new: true });
      if (!spot) return APIResp.getErrorResult("Parking spot not found", res);

      APIResp.Ok(spot, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== LIST ALL SPOTS ======
  listSpots = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const spots = await ParkingSpot.find().sort({ floor: 1, spotNumber: 1 });
      APIResp.Ok(spots, res);
    } catch (err) {
      next(err);
    }
  };
}
