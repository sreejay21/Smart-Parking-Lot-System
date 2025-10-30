import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  role: "admin" | "operator" | "user";
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "operator", "user"], default: "operator" }
});

export const User = model<IUser>("User", UserSchema);