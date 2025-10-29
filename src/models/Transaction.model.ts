import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
  vehicle: Schema.Types.ObjectId;
  vehicleNumber: string;
  vehicleType: "motorcycle" | "car" | "bus";
  parkingSpot: Schema.Types.ObjectId;
  spotCode: string;
  checkIn: Date;
  checkOut?: Date;
  fee?: number;
  status: "ONGOING" | "COMPLETED";
}

const TransactionSchema = new Schema<ITransaction>({
  vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ["motorcycle", "car", "bus"], required: true },
  parkingSpot: { type: Schema.Types.ObjectId, ref: "ParkingSpot", required: true },
  spotCode: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: Date,
  fee: Number,
  status: { type: String, enum: ["ONGOING", "COMPLETED"], default: "ONGOING" }
});

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
