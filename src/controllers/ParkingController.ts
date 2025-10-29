import { Request, Response, NextFunction } from "express";
import { ParkingRepository } from "../repositories/ParkingRepository";
import { redisClient } from "../utils/redisClient";
import { calculateFee } from "../utils/feeCalculator";
import { APIResp } from "../utils/apiResponse";

export class ParkingController {
  #repo: ParkingRepository;

  constructor() {
    this.#repo = new ParkingRepository();
  }

  #getCandidateSizes(vehicleType: string) {
    const order = ["motorcycle", "car", "bus"];
    const idx = order.indexOf(vehicleType);
    return idx >= 0 ? order.slice(idx) : [vehicleType];
  }


  async #getPreferredSpotIdFromCache(vehicleType: string): Promise<string | null> {
    const best = await redisClient.getBestSpotId(vehicleType);
    if (best) return best;

    if (vehicleType === "motorcycle") {
      return (await redisClient.getBestSpotId("car")) || (await redisClient.getBestSpotId("bus"));
    }
    if (vehicleType === "car") return (await redisClient.getBestSpotId("bus")) || null;

    return null;
  }

  async #removeSpotFromCache(spot: any) {
    if (!spot) return;
    try {
      await redisClient.removeAvailableSpot(spot.type, spot._id.toString());
    } catch (err) {
      console.warn("Redis removeAvailableSpot failed:", err);
    }
  }

  checkIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number, type, owner } = req.body;
      const preferredSpotId = await this.#getPreferredSpotIdFromCache(type);
      const candidates = this.#getCandidateSizes(type);

      const result = await this.#repo.transactionalCheckIn(candidates, preferredSpotId, { number, type, owner });

      if (!result.success) {
        if (preferredSpotId) {
          const retry = await this.#repo.transactionalCheckIn(candidates, null, { number, type, owner });
          if (!retry.success) throw new Error(retry.reason || "No spot available");

          await this.#removeSpotFromCache(retry.spot);
          return APIResp.successCreate({ transaction: retry.transaction, spot: retry.spot }, res);
        }
        throw new Error(result.reason || "No spot available");
      }

      await this.#removeSpotFromCache(result.spot);
      APIResp.successCreate({ transaction: result.transaction, spot: result.spot }, res);
    } catch (err) {
      next(err);
    }
  };

  checkOutByVehicleNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number } = req.params;
      const active = await this.#repo.getActiveTransactionByVehicleNumber(number);

      if (!active) throw new Error("No active transaction for vehicle");

      const fee = calculateFee(active.vehicleType as any, active.checkIn, new Date());
      const resTxn = await this.#repo.transactionalCheckOut(active._id.toString(), fee);

      if (!resTxn.success) throw new Error(resTxn.reason || "Checkout failed");

      const txnDoc = await this.#repo.getTransactionById(active._id.toString());
      const spotDoc: any = txnDoc ? (txnDoc as any).parkingSpot : null;

      if (spotDoc) {
        try {
          await redisClient.addAvailableSpot(spotDoc.type, spotDoc._id.toString(), spotDoc.floor, spotDoc.spotNumber);
        } catch (err) {
          console.warn("Redis addAvailableSpot failed:", err);
        }
      }

      APIResp.Ok({ transaction: resTxn.transaction, fee }, res);
    } catch (err) {
      next(err);
    }
  };


  getAvailability = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.#repo.getAvailableSpotsGrouped();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getAllTransactions = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.#repo.getAllTransactions();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.#repo.getTransactionById(id);
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getActiveTransactions = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.#repo.getActiveTransactions();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };

  getRevenueByDate = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.#repo.getRevenueByDate();
      APIResp.Ok(data, res);
    } catch (err) {
      next(err);
    }
  };
}
