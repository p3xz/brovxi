export type FuelType = 'petrol' | 'diesel' | 'cng';
export type FuelInputMode = 'litres' | 'amount';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'JPY';
export type DistanceUnit = 'km' | 'mi';
export type VolumeUnit = 'L' | 'gal';
export type FuelEfficiencyUnit = 'km/L' | 'L/100km' | 'mpg (US)' | 'mpg (UK)';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
};

export interface FuelPreferences {
  currency: CurrencyCode;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  efficiencyUnit: FuelEfficiencyUnit;
  defaultFuelType: FuelType;
}

export const DEFAULT_FUEL_PREFERENCES: FuelPreferences = {
  currency: 'INR',
  distanceUnit: 'km',
  volumeUnit: 'L',
  efficiencyUnit: 'km/L',
  defaultFuelType: 'petrol',
};

/**
 * Raw Source Record stored in SQLite
 * Canonical storage: odometer in km, fuelAddedLitres in L.
 */
export interface RawFuelLog {
  id: string;
  vehicle_id: string;
  odometer: number; // in km
  fuel_added_litres: number; // in Litres
  price_per_litre: number;
  total_cost: number;
  currency: CurrencyCode;
  fuel_type: FuelType;
  full_tank: number; // 1 = full, 0 = partial
  timestamp: string; // ISO string
  input_mode: FuelInputMode;
  manually_adjusted: number; // 1 = true, 0 = false
  note: string | null;
  created_at: number; // Epoch ms
}

/**
 * Clean In-Memory Domain Model
 */
export interface FuelLog {
  id: string;
  vehicleId: string;
  odometer: number; // in km
  fuelAddedLitres: number; // in Litres
  pricePerLitre: number;
  totalCost: number;
  currency: CurrencyCode;
  fuelType: FuelType;
  fullTank: boolean;
  timestamp: string;
  inputMode: FuelInputMode;
  manuallyAdjusted: boolean;
  note?: string;
  createdAt: number;
}

/**
 * Dynamically Derived Fuel Log for UI presentation
 */
export interface DerivedFuelLog extends FuelLog {
  logNumber: number; // 1, 2, ... N
  distanceSincePreviousKm: number | null;
  calculatedMileageKmPerL: number | null;
  costPerKm: number | null;
  isPartialFill: boolean;
  isStartOfChain: boolean;
}

/**
 * High-Level Statistics derived dynamically
 */
export interface FuelSummaryStatistics {
  hasEnoughData: boolean;
  totalLogsCount: number;
  averageMileage: number | null; // in canonical km/L
  lastMileage: number | null; // in canonical km/L
  bestMileage: number | null; // in canonical km/L
  worstMileage: number | null; // in canonical km/L
  totalFuelLitres: number;
  totalCost: number;
  primaryCurrency: CurrencyCode;
  averageFuelPrice: number | null;
  lastFuelPrice: number | null;
  lastFuelPriceCurrency: CurrencyCode;
  averageCostPerKm: number | null;
  lastRefuelDate: string | null;
  totalTrackedDistanceKm: number;
}
