import { VEHICLE_RATES, VehicleType } from "../config/constants";

export function calculateFee(vehicleType: VehicleType, checkIn: Date, checkOut: Date): number {
  const rates = VEHICLE_RATES[vehicleType];
  const minutes = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 60000);
  if (minutes <= rates.baseMinutes) return rates.baseRate;
  const extraMinutes = minutes - rates.baseMinutes;
  const hours = Math.ceil(extraMinutes / 60);
  return rates.baseRate + hours * rates.perHour;
}
