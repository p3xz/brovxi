import { getSetting, setSetting } from './settingsRepository';
import {
  FuelPreferences,
  DEFAULT_FUEL_PREFERENCES,
  CurrencyCode,
  DistanceUnit,
  VolumeUnit,
  FuelEfficiencyUnit,
  FuelType,
} from '../types/fuel';

export async function getFuelPreferences(): Promise<FuelPreferences> {
  const [currency, distanceUnit, volumeUnit, efficiencyUnit, defaultFuelType] =
    await Promise.all([
      getSetting('fuel_pref_currency'),
      getSetting('fuel_pref_distance_unit'),
      getSetting('fuel_pref_volume_unit'),
      getSetting('fuel_pref_efficiency_unit'),
      getSetting('fuel_pref_default_fuel_type'),
    ]);

  return {
    currency: (currency as CurrencyCode) || DEFAULT_FUEL_PREFERENCES.currency,
    distanceUnit: (distanceUnit as DistanceUnit) || DEFAULT_FUEL_PREFERENCES.distanceUnit,
    volumeUnit: (volumeUnit as VolumeUnit) || DEFAULT_FUEL_PREFERENCES.volumeUnit,
    efficiencyUnit: (efficiencyUnit as FuelEfficiencyUnit) || DEFAULT_FUEL_PREFERENCES.efficiencyUnit,
    defaultFuelType: (defaultFuelType as FuelType) || DEFAULT_FUEL_PREFERENCES.defaultFuelType,
  };
}

export async function setFuelPreferences(prefs: Partial<FuelPreferences>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (prefs.currency !== undefined) {
    promises.push(setSetting('fuel_pref_currency', prefs.currency));
  }
  if (prefs.distanceUnit !== undefined) {
    promises.push(setSetting('fuel_pref_distance_unit', prefs.distanceUnit));
  }
  if (prefs.volumeUnit !== undefined) {
    promises.push(setSetting('fuel_pref_volume_unit', prefs.volumeUnit));
  }
  if (prefs.efficiencyUnit !== undefined) {
    promises.push(setSetting('fuel_pref_efficiency_unit', prefs.efficiencyUnit));
  }
  if (prefs.defaultFuelType !== undefined) {
    promises.push(setSetting('fuel_pref_default_fuel_type', prefs.defaultFuelType));
  }

  await Promise.all(promises);
}
