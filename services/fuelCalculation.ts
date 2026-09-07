import {
  FuelLog,
  DerivedFuelLog,
  FuelSummaryStatistics,
  FuelPreferences,
  CurrencyCode,
  DistanceUnit,
  VolumeUnit,
  FuelEfficiencyUnit,
  CURRENCIES,
} from '../types/fuel';

const KM_PER_MILE = 1.609344;
const LITRES_PER_US_GALLON = 3.785411784;
const LITRES_PER_UK_GALLON = 4.54609;

// ==========================================
// CANONICAL CONVERSION UTILS
// ==========================================

export function convertKmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

export function convertMilesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

export function convertLitresToGallons(litres: number, isUk: boolean = false): number {
  return litres / (isUk ? LITRES_PER_UK_GALLON : LITRES_PER_US_GALLON);
}

export function convertGallonsToLitres(gallons: number, isUk: boolean = false): number {
  return gallons * (isUk ? LITRES_PER_UK_GALLON : LITRES_PER_US_GALLON);
}

/**
 * Convert canonical km/L into target fuel efficiency unit
 */
export function convertMileageFromCanonical(
  kmPerL: number,
  targetUnit: FuelEfficiencyUnit
): number {
  if (kmPerL <= 0) return 0;
  switch (targetUnit) {
    case 'km/L':
      return kmPerL;
    case 'L/100km':
      return 100 / kmPerL;
    case 'mpg (US)':
      // 1 km/L = 2.35214583 mpg (US)
      return kmPerL * (LITRES_PER_US_GALLON / KM_PER_MILE);
    case 'mpg (UK)':
      // 1 km/L = 2.82480936 mpg (UK)
      return kmPerL * (LITRES_PER_UK_GALLON / KM_PER_MILE);
    default:
      return kmPerL;
  }
}

// ==========================================
// DYNAMIC FUEL LOG DERIVATION ENGINE
// ==========================================

/**
 * Derives distance, mileage, cost/km, and log numbers from raw chronological logs.
 * Raw logs must be sorted by odometer ASC prior to computation.
 * Returns array reversed (newest first: Log N down to Log 1) for UI display.
 */
export function deriveFuelLogs(rawLogs: FuelLog[]): DerivedFuelLog[] {
  if (rawLogs.length === 0) {
    return [];
  }

  // Ensure sorted by odometer ascending, then timestamp
  const sorted = [...rawLogs].sort((a, b) => {
    if (a.odometer !== b.odometer) {
      return a.odometer - b.odometer;
    }
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const derivedAsc: DerivedFuelLog[] = [];
  let lastFullTankLog: FuelLog | null = null;
  let accumulatedFuelSinceFullTank = 0;
  let accumulatedCostSinceFullTank = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const logNumber = i + 1;

    let distanceSincePreviousKm: number | null = null;
    if (i > 0) {
      distanceSincePreviousKm = Math.max(0, current.odometer - sorted[i - 1].odometer);
    }

    let calculatedMileageKmPerL: number | null = null;
    let costPerKm: number | null = null;
    let isPartialFill = !current.fullTank;
    let isStartOfChain = false;

    if (i === 0) {
      // First log: starting reference point
      if (current.fullTank) {
        lastFullTankLog = current;
        accumulatedFuelSinceFullTank = 0;
        accumulatedCostSinceFullTank = 0;
      }
      isStartOfChain = true;
    } else {
      accumulatedFuelSinceFullTank += current.fuelAddedLitres;
      accumulatedCostSinceFullTank += current.totalCost;

      if (current.fullTank && lastFullTankLog !== null) {
        // Complete full-tank cycle reached!
        const totalDistanceInChain = current.odometer - lastFullTankLog.odometer;

        if (totalDistanceInChain > 0 && accumulatedFuelSinceFullTank > 0) {
          calculatedMileageKmPerL =
            Math.round((totalDistanceInChain / accumulatedFuelSinceFullTank) * 100) / 100;
          costPerKm =
            Math.round((accumulatedCostSinceFullTank / totalDistanceInChain) * 100) / 100;
        }

        // Reset accumulator to this new full-tank anchor
        lastFullTankLog = current;
        accumulatedFuelSinceFullTank = 0;
        accumulatedCostSinceFullTank = 0;
        isPartialFill = false;
      } else if (current.fullTank && lastFullTankLog === null) {
        // First full tank after previous partial fills
        lastFullTankLog = current;
        accumulatedFuelSinceFullTank = 0;
        accumulatedCostSinceFullTank = 0;
        isStartOfChain = true;
        isPartialFill = false;
      } else {
        // Partial fill: mileage cannot be calculated until next full tank
        isPartialFill = true;
      }
    }

    derivedAsc.push({
      ...current,
      logNumber,
      distanceSincePreviousKm,
      calculatedMileageKmPerL,
      costPerKm,
      isPartialFill,
      isStartOfChain,
    });
  }

  // Return reverse chronological (newest first: Log N -> Log 1)
  return derivedAsc.reverse();
}

// ==========================================
// SUMMARY STATISTICS COMPUTATION
// ==========================================

export function computeFuelSummary(
  derivedLogsDesc: DerivedFuelLog[],
  fallbackCurrency: CurrencyCode = 'INR'
): FuelSummaryStatistics {
  if (derivedLogsDesc.length === 0) {
    return {
      hasEnoughData: false,
      totalLogsCount: 0,
      averageMileage: null,
      lastMileage: null,
      bestMileage: null,
      worstMileage: null,
      totalFuelLitres: 0,
      totalCost: 0,
      primaryCurrency: fallbackCurrency,
      averageFuelPrice: null,
      lastFuelPrice: null,
      lastFuelPriceCurrency: fallbackCurrency,
      averageCostPerKm: null,
      lastRefuelDate: null,
      totalTrackedDistanceKm: 0,
    };
  }

  const newest = derivedLogsDesc[0];
  const oldest = derivedLogsDesc[derivedLogsDesc.length - 1];

  let totalFuelLitres = 0;
  let totalCost = 0;
  const validMileages: number[] = [];

  for (const log of derivedLogsDesc) {
    totalFuelLitres += log.fuelAddedLitres;
    totalCost += log.totalCost;
    if (log.calculatedMileageKmPerL !== null && log.calculatedMileageKmPerL > 0) {
      validMileages.push(log.calculatedMileageKmPerL);
    }
  }

  const totalTrackedDistanceKm = Math.max(0, newest.odometer - oldest.odometer);

  let averageMileage: number | null = null;
  let lastMileage: number | null = null;
  let bestMileage: number | null = null;
  let worstMileage: number | null = null;

  if (validMileages.length > 0) {
    // Valid mileage records exist!
    lastMileage = validMileages[0]; // Newest valid mileage
    bestMileage = Math.max(...validMileages);
    worstMileage = Math.min(...validMileages);
    const sumMileage = validMileages.reduce((acc, m) => acc + m, 0);
    averageMileage = Math.round((sumMileage / validMileages.length) * 100) / 100;
  }

  const averageFuelPrice =
    totalFuelLitres > 0 ? Math.round((totalCost / totalFuelLitres) * 100) / 100 : null;
  const lastFuelPrice = newest.pricePerLitre;
  const lastFuelPriceCurrency = newest.currency;

  let averageCostPerKm: number | null = null;
  if (totalTrackedDistanceKm > 0 && totalCost > 0) {
    averageCostPerKm = Math.round((totalCost / totalTrackedDistanceKm) * 100) / 100;
  }

  return {
    hasEnoughData: derivedLogsDesc.length > 0,
    totalLogsCount: derivedLogsDesc.length,
    averageMileage,
    lastMileage,
    bestMileage,
    worstMileage,
    totalFuelLitres: Math.round(totalFuelLitres * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    primaryCurrency: newest.currency || fallbackCurrency,
    averageFuelPrice,
    lastFuelPrice,
    lastFuelPriceCurrency,
    averageCostPerKm,
    lastRefuelDate: newest.timestamp,
    totalTrackedDistanceKm: Math.round(totalTrackedDistanceKm * 10) / 10,
  };
}

// ==========================================
// FORMATTING HELPERS
// ==========================================

export function formatCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol || '₹';
}

export function formatDisplayCurrency(
  amount: number,
  code: CurrencyCode = 'INR',
  decimals: number = 2
): string {
  const symbol = formatCurrencySymbol(code);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

export function formatDisplayDistance(
  km: number,
  unit: DistanceUnit = 'km',
  showUnit: boolean = true
): string {
  const val = unit === 'mi' ? convertKmToMiles(km) : km;
  const str = Math.round(val).toLocaleString('en-US');
  return showUnit ? `${str} ${unit}` : str;
}

export function formatDisplayVolume(
  litres: number,
  unit: VolumeUnit = 'L',
  showUnit: boolean = true,
  decimals: number = 2
): string {
  const val = unit === 'gal' ? convertLitresToGallons(litres) : litres;
  const str = val.toFixed(decimals);
  return showUnit ? `${str} ${unit}` : str;
}

export function formatDisplayMileage(
  kmPerL: number,
  effUnit: FuelEfficiencyUnit = 'km/L',
  showUnit: boolean = true
): string {
  const converted = convertMileageFromCanonical(kmPerL, effUnit);
  const str = converted.toFixed(2);
  return showUnit ? `${str} ${effUnit}` : str;
}

export function formatDisplayRate(
  pricePerLitre: number,
  currency: CurrencyCode = 'INR',
  volumeUnit: VolumeUnit = 'L'
): string {
  const symbol = formatCurrencySymbol(currency);
  const adjustedPrice =
    volumeUnit === 'gal' ? pricePerLitre * LITRES_PER_US_GALLON : pricePerLitre;
  return `${symbol}${adjustedPrice.toFixed(2)}/${volumeUnit}`;
}
