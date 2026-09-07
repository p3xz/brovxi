import { getDatabase } from './database';
import { FuelLog, RawFuelLog } from '../types/fuel';

function mapRawToDomain(raw: RawFuelLog): FuelLog {
  return {
    id: raw.id,
    vehicleId: raw.vehicle_id,
    odometer: Number(raw.odometer),
    fuelAddedLitres: Number(raw.fuel_added_litres),
    pricePerLitre: Number(raw.price_per_litre),
    totalCost: Number(raw.total_cost),
    currency: raw.currency,
    fuelType: raw.fuel_type,
    fullTank: raw.full_tank === 1,
    timestamp: raw.timestamp,
    inputMode: raw.input_mode,
    manuallyAdjusted: raw.manually_adjusted === 1,
    note: raw.note ?? undefined,
    createdAt: raw.created_at,
  };
}

export async function createFuelLog(log: FuelLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO fuel_logs (
      id, vehicle_id, odometer, fuel_added_litres, price_per_litre,
      total_cost, currency, fuel_type, full_tank, timestamp,
      input_mode, manually_adjusted, note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.id,
      log.vehicleId || 'default',
      log.odometer,
      log.fuelAddedLitres,
      log.pricePerLitre,
      log.totalCost,
      log.currency || 'INR',
      log.fuelType || 'petrol',
      log.fullTank ? 1 : 0,
      log.timestamp || new Date().toISOString(),
      log.inputMode || 'litres',
      log.manuallyAdjusted ? 1 : 0,
      log.note ?? null,
      log.createdAt || Date.now(),
    ]
  );
}

export async function updateFuelLog(id: string, updates: Partial<FuelLog>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.vehicleId !== undefined) {
    fields.push('vehicle_id = ?');
    values.push(updates.vehicleId);
  }
  if (updates.odometer !== undefined) {
    fields.push('odometer = ?');
    values.push(updates.odometer);
  }
  if (updates.fuelAddedLitres !== undefined) {
    fields.push('fuel_added_litres = ?');
    values.push(updates.fuelAddedLitres);
  }
  if (updates.pricePerLitre !== undefined) {
    fields.push('price_per_litre = ?');
    values.push(updates.pricePerLitre);
  }
  if (updates.totalCost !== undefined) {
    fields.push('total_cost = ?');
    values.push(updates.totalCost);
  }
  if (updates.currency !== undefined) {
    fields.push('currency = ?');
    values.push(updates.currency);
  }
  if (updates.fuelType !== undefined) {
    fields.push('fuel_type = ?');
    values.push(updates.fuelType);
  }
  if (updates.fullTank !== undefined) {
    fields.push('full_tank = ?');
    values.push(updates.fullTank ? 1 : 0);
  }
  if (updates.timestamp !== undefined) {
    fields.push('timestamp = ?');
    values.push(updates.timestamp);
  }
  if (updates.inputMode !== undefined) {
    fields.push('input_mode = ?');
    values.push(updates.inputMode);
  }
  if (updates.manuallyAdjusted !== undefined) {
    fields.push('manually_adjusted = ?');
    values.push(updates.manuallyAdjusted ? 1 : 0);
  }
  if (updates.note !== undefined) {
    fields.push('note = ?');
    values.push(updates.note ?? null);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE fuel_logs SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteFuelLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM fuel_logs WHERE id = ?', [id]);
}

export async function getFuelLogById(id: string): Promise<FuelLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawFuelLog>(
    'SELECT * FROM fuel_logs WHERE id = ?',
    [id]
  );
  return row ? mapRawToDomain(row) : null;
}

/**
 * Fetch all fuel logs for a vehicle, sorted by odometer ASC (and timestamp secondary)
 * for dynamic sequential mileage derivation.
 */
export async function getFuelLogsForVehicle(vehicleId?: string): Promise<FuelLog[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM fuel_logs';
  const params: any[] = [];

  if (vehicleId && vehicleId !== 'all') {
    query += ' WHERE vehicle_id = ?';
    params.push(vehicleId);
  }

  query += ' ORDER BY odometer ASC, timestamp ASC, created_at ASC';

  const rows = await db.getAllAsync<RawFuelLog>(query, params);
  return rows.map(mapRawToDomain);
}

/**
 * Get the latest fuel log for a vehicle (highest odometer / newest)
 */
export async function getLatestFuelLogForVehicle(vehicleId?: string): Promise<FuelLog | null> {
  const db = await getDatabase();
  let query = 'SELECT * FROM fuel_logs';
  const params: any[] = [];

  if (vehicleId && vehicleId !== 'all') {
    query += ' WHERE vehicle_id = ?';
    params.push(vehicleId);
  }

  query += ' ORDER BY odometer DESC, timestamp DESC LIMIT 1';

  const row = await db.getFirstAsync<RawFuelLog>(query, params);
  return row ? mapRawToDomain(row) : null;
}

export async function deleteAllFuelLogs(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM fuel_logs');
}
