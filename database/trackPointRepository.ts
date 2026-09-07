import { getDatabase } from './database';
import { TrackPoint } from '../types/ride';

export async function insertTrackPoint(point: TrackPoint): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO track_points (ride_id, latitude, longitude, altitude, speed, accuracy, heading, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      point.ride_id,
      point.latitude,
      point.longitude,
      point.altitude ?? null,
      point.speed ?? null,
      point.accuracy ?? null,
      point.heading ?? null,
      point.timestamp,
    ]
  );
}

export async function insertTrackPointsBatch(points: TrackPoint[]): Promise<void> {
  if (points.length === 0) return;
  const db = await getDatabase();
  
  await db.withTransactionAsync(async () => {
    for (const point of points) {
      await db.runAsync(
        `INSERT INTO track_points (ride_id, latitude, longitude, altitude, speed, accuracy, heading, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          point.ride_id,
          point.latitude,
          point.longitude,
          point.altitude ?? null,
          point.speed ?? null,
          point.accuracy ?? null,
          point.heading ?? null,
          point.timestamp,
        ]
      );
    }
  });
}

export async function getTrackPointsByRideId(rideId: string): Promise<TrackPoint[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TrackPoint>(
    `SELECT * FROM track_points WHERE ride_id = ? ORDER BY timestamp ASC;`,
    [rideId]
  );
  return rows;
}

export async function getTrackPointsCount(rideId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM track_points WHERE ride_id = ?;`,
    [rideId]
  );
  return result?.count ?? 0;
}
