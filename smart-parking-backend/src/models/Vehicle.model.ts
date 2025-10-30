import { Schema, model, Document } from "mongoose";

export interface IVehicle extends Document {
  number: string;
  type: "motorcycle" | "car" | "bus";
  owner?: string;
}

const VehicleSchema = new Schema<IVehicle>({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ["motorcycle", "car", "bus"], required: true },
  owner: { type: String }
});

export const Vehicle = model<IVehicle>("Vehicle", VehicleSchema);
