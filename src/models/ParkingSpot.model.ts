import { Schema, model, Document } from "mongoose";

export interface IParkingSpot extends Document {
  code: string;
  floor: number;
  zone?: string;
  type: "motorcycle" | "car" | "bus";
  isAvailable: boolean;
  spotNumber: number;
}

const ParkingSpotSchema = new Schema<IParkingSpot>({
  code: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  zone: { type: String, default: "A" },
  type: { type: String, enum: ["motorcycle", "car", "bus"], required: true },
  isAvailable: { type: Boolean, default: true },
  spotNumber: { type: Number, required: true }
});

ParkingSpotSchema.index({ type: 1, isAvailable: 1, floor: 1, spotNumber: 1 });

export const ParkingSpot = model<IParkingSpot>("ParkingSpot", ParkingSpotSchema);
