export type ParkingSpot = {
  _id?: string;
  code: string;
  floor: number;
  zone?: string;
  type: "car" | "bus" | "motorcycle";
  isAvailable?: boolean;
  spotNumber: number;
};
