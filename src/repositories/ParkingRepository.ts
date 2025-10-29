import mongoose from "mongoose";
import { ParkingSpot } from "../models/ParkingSpot.model";
import { Vehicle } from "../models/Vehicle.model";
import { Transaction } from "../models/Transaction.model";

/**
 * ParkingRepository - DB operations with transactions
 */
export class ParkingRepository {
  async findAvailableSpotBySize(size: string) {
    return ParkingSpot.findOne({ type: size, isAvailable: true }).sort({ floor: 1, spotNumber: 1 });
  }

  async getTransactionById(id: string) {
    return Transaction.findById(id).populate("parkingSpot").populate("vehicle");
  }

  async getAllTransactions() {
    return Transaction.find().populate("parkingSpot").populate("vehicle").sort({ checkIn: -1 });
  }

  async getActiveTransactions() {
    return Transaction.find({ status: "ONGOING" }).populate("parkingSpot").populate("vehicle");
  }

  async getAvailableSpotsGrouped() {
    return ParkingSpot.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: "$floor", spots: { $push: { spotNumber: "$spotNumber", id: "$_id", type: "$type", code: "$code" } } } },
      { $sort: { _id: 1 } }
    ]);
  }

  async getRevenueByDate() {
    return Transaction.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkOut" } },
          totalRevenue: { $sum: "$fee" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": -1 } }
    ]);
  }

  // transactional check-in
  async transactionalCheckIn(
    sizeCandidates: string[],
    preferredSpotId: string | null,
    vehiclePayload: { number: string; type: string; owner?: string }
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const vehicle = await Vehicle.findOneAndUpdate(
        { number: vehiclePayload.number },
        { $set: { number: vehiclePayload.number, type: vehiclePayload.type, owner: vehiclePayload.owner } },
        { upsert: true, new: true, session }
      );

      let spot: any | null = null;

      if (preferredSpotId) {
        spot = await ParkingSpot.findOne({ _id: preferredSpotId, isAvailable: true }).session(session);
        if (spot) {
          spot.isAvailable = false;
          await spot.save({ session });
        }
      }

      if (!spot) {
        for (const size of sizeCandidates) {
          spot = await ParkingSpot.findOne({ type: size, isAvailable: true }).sort({ floor: 1, spotNumber: 1 }).session(session);
          if (spot) {
            spot.isAvailable = false;
            await spot.save({ session });
            break;
          }
        }
      }

      if (!spot) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, reason: "No available spot" };
      }

      const txns = await Transaction.create(
        [
          {
            vehicle: vehicle._id,
            vehicleNumber: vehicle.number,
            vehicleType: vehicle.type,
            parkingSpot: spot._id,
            spotCode: spot.code,
            checkIn: new Date(),
            status: "ONGOING"
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return { success: true, transaction: txns[0], spot };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // transactional check-out
  async transactionalCheckOut(transactionId: string, fee: number) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const txn = await Transaction.findById(transactionId).session(session);
      if (!txn) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, reason: "Transaction not found" };
      }
      if (txn.status === "COMPLETED") {
        await session.abortTransaction();
        session.endSession();
        return { success: false, reason: "Already checked out" };
      }

      txn.checkOut = new Date();
      txn.fee = fee;
      txn.status = "COMPLETED";
      await txn.save({ session });

      await ParkingSpot.findByIdAndUpdate(txn.parkingSpot, { isAvailable: true }, { session });

      await session.commitTransaction();
      session.endSession();
      return { success: true, transaction: txn };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // helper: get active txn by vehicle number
  async getActiveTransactionByVehicleNumber(number: string) {
    const vehicle = await Vehicle.findOne({ number });
    if (!vehicle) return null;
    return Transaction.findOne({ vehicle: vehicle._id, status: "ONGOING" }).populate("parkingSpot").populate("vehicle");
  }
}
