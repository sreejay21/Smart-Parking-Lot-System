export const VEHICLE_RATES = {
  motorcycle: { baseMinutes: 15, baseRate: 5, perHour: 20 },
  car: { baseMinutes: 30, baseRate: 20, perHour: 50 },
  bus: { baseMinutes: 30, baseRate: 50, perHour: 150 }
} as const;

export type VehicleType = keyof typeof VEHICLE_RATES;

export const TOKEN_EXPIRY = '8h';
