import { Request, Response, NextFunction } from "express";
import { ParkingRepository } from "../repositories/ParkingRepository";
import { ParkingSpot } from "../models/ParkingSpot.model";
import { APIResp } from "../utils/apiResponse";
import { calculateFee } from "../utils/feeCalculator";

const repo = new ParkingRepository();

export class ParkingController {
  // ====== VEHICLE ENTRY ======
  checkIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number, type, owner } = req.body;
      const candidates = this.getCandidateSizes(type);
      const result = await repo.transactionalCheckIn(candidates, null, { number, type, owner });

      if (!result.success) {
        return APIResp.getErrorResult(result.reason || "No available spot", res);
      }

      APIResp.successCreate({ transaction: result.transaction, spot: result.spot }, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== VEHICLE EXIT ======
  checkOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number } = req.params;
      const active = await repo.getActiveTransactionByVehicleNumber(number);

      if (!active) return APIResp.getErrorResult("No active transaction found", res);

      const fee = calculateFee(active.vehicleType as any, active.checkIn, new Date());
      const resTxn = await repo.transactionalCheckOut(active._id.toString(), fee);

      if (!resTxn.success) return APIResp.getErrorResult(resTxn.reason || "Checkout failed", res);

      APIResp.Ok({ transaction: resTxn.transaction, fee }, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== GET AVAILABILITY ======
  getAvailability = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getAvailableSpotsGrouped();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== GET TRANSACTIONS ======
  getAllTransactions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getAllTransactions();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getActiveTransactions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getActiveTransactions();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getTransactionById(req.params.id);
      if (!data) return APIResp.getErrorResult("Transaction not found", res);
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getRevenueByDate = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await repo.getRevenueByDate();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  // ====== PARKING SPOTS MANAGEMENT ======
  createParkingSpot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, floor, zone, type, spotNumber } = req.body;

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

      APIResp.successCreate(spot, res);
    } catch (err) {
      next(err);
    }
  };

  updateParkingSpot = async (req: Request, res: Response, next: NextFunction) => {
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

  // ====== HELPER ======
  private getCandidateSizes(vehicleType: string) {
    const order = ["motorcycle", "car", "bus"];
    const idx = order.indexOf(vehicleType);
    return idx >= 0 ? order.slice(idx) : [vehicleType];
  }
}
