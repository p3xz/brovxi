import { RawGPSPoint } from '../types/ride';
import { GPS_CONFIG } from '../constants/gps';
import { calculateDistanceMeters } from './distance';

export interface GPSValidationResult {
  isValid: boolean;
  reason?: string;
  isStationaryJitter?: boolean;
  /** Single authoritative segment speed derived from coordinates. Used for ALL speed metrics. */
  segmentSpeedKmh?: number;
  /** Haversine distance from previous point in meters. */
  segmentDistanceMeters?: number;
  /** Timestamp delta from previous point in seconds. */
  segmentTimeSeconds?: number;
}

/**
 * Contextual GPS filter that preserves legitimate route points while rejecting
 * impossible jumps, invalid coords, duplicate points, extreme spikes, and stale mock/hardware caches.
 *
 * CRITICAL DESIGN INVARIANT:
 * All returned metrics (segmentSpeedKmh, segmentDistanceMeters, segmentTimeSeconds) are derived
 * from a SINGLE source of truth: the Haversine coordinate distance divided by the GPS timestamp delta.
 * This guarantees that avg(speed) <= max(speed) mathematically, because average speed is the
 * time-weighted mean of individual segment speeds.
 */
export function validateGPSPoint(
  current: RawGPSPoint,
  previous: RawGPSPoint | null
): GPSValidationResult {
  // 1. Basic Coordinate Sanity Check
  if (
    typeof current.latitude !== 'number' ||
    typeof current.longitude !== 'number' ||
    isNaN(current.latitude) ||
    isNaN(current.longitude)
  ) {
    return { isValid: false, reason: 'Invalid coordinate numbers' };
  }

  if (
    current.latitude < -90 ||
    current.latitude > 90 ||
    current.longitude < -180 ||
    current.longitude > 180
  ) {
    return { isValid: false, reason: 'Coordinates out of geographic range' };
  }

  // Null Island check (exact 0,0 usually means uninitialized GPS)
  if (Math.abs(current.latitude) < 0.0001 && Math.abs(current.longitude) < 0.0001) {
    return { isValid: false, reason: 'Null Island (0,0) coordinate' };
  }

  // 2. Severe Accuracy Rejection
  if (
    current.accuracy !== null &&
    current.accuracy > GPS_CONFIG.MAX_ACCEPTABLE_ACCURACY_METERS
  ) {
    return { isValid: false, reason: `Accuracy too poor (${Math.round(current.accuracy)}m)` };
  }

  // First point of a ride: accept position, zero movement
  if (!previous) {
    return {
      isValid: true,
      isStationaryJitter: true,
      segmentSpeedKmh: 0,
      segmentDistanceMeters: 0,
      segmentTimeSeconds: 0,
    };
  }

  // 3. Time Delta Check
  const timeDeltaMs = current.timestamp - previous.timestamp;
  if (timeDeltaMs <= 0) {
    return { isValid: false, reason: 'Duplicate or backward timestamp' };
  }

  const timeDeltaSeconds = timeDeltaMs / 1000;
  const distanceMeters = calculateDistanceMeters(
    { latitude: previous.latitude, longitude: previous.longitude },
    { latitude: current.latitude, longitude: current.longitude }
  );

  // 4. Point-to-Point Velocity Check (single authoritative speed)
  const segmentSpeedMs = distanceMeters / timeDeltaSeconds;
  const segmentSpeedKmh = segmentSpeedMs * 3.6;

  // If segment speed exceeds maximum plausible motorcycle velocity, reject the entire segment
  if (segmentSpeedKmh > GPS_CONFIG.MAX_PLAUSIBLE_SPEED_KMH) {
    return {
      isValid: false,
      reason: `Impossible speed (${Math.round(segmentSpeedKmh)} km/h, ${Math.round(distanceMeters)}m in ${timeDeltaSeconds.toFixed(1)}s)`,
      segmentDistanceMeters: distanceMeters,
      segmentTimeSeconds: timeDeltaSeconds,
    };
  }

  // 5. Stationary Jitter / Stopped Vehicle
  // If the coordinate displacement is negligible AND the derived speed is below moving threshold,
  // classify as stationary. Distance, speed, and moving time are all zero for this segment.
  if (distanceMeters < GPS_CONFIG.MIN_STATIONARY_DISTANCE_METERS && segmentSpeedMs < GPS_CONFIG.MIN_MOVING_SPEED_MS) {
    return {
      isValid: true,
      isStationaryJitter: true,
      segmentSpeedKmh: 0,
      segmentDistanceMeters: 0,
      segmentTimeSeconds: timeDeltaSeconds,
    };
  }

  // 6. Contextual Accuracy & Velocity Continuity during poor GPS
  if (
    current.accuracy !== null &&
    current.accuracy > GPS_CONFIG.BASE_ACCURACY_THRESHOLD_METERS
  ) {
    const reportedSpeedKmh = (current.speed ?? 0) * 3.6;
    const speedDifference = Math.abs(segmentSpeedKmh - reportedSpeedKmh);

    // If there is a massive discrepancy during poor accuracy, reject
    if (speedDifference > 60 && segmentSpeedKmh > 80) {
      return {
        isValid: false,
        reason: 'Inconsistent velocity during poor accuracy',
        segmentDistanceMeters: distanceMeters,
        segmentTimeSeconds: timeDeltaSeconds,
      };
    }
  }

  // 7. Cross-check: if hardware reports 0 speed but coordinates show large movement,
  // use the coordinate-derived speed (hardware speed can be stale in simulators).
  // If hardware reports high speed but coordinates show no movement, trust coordinates (speed = ~0).
  // In all cases the COORDINATE-DERIVED speed is authoritative.

  // Final speed is the coordinate-derived segment speed, capped to plausible range
  const finalSpeedKmh = Math.min(segmentSpeedKmh, GPS_CONFIG.MAX_PLAUSIBLE_SPEED_KMH);

  // If final speed is below moving threshold but distance is also tiny, mark stationary
  if (finalSpeedKmh < GPS_CONFIG.MIN_MOVING_SPEED_KMH && distanceMeters < GPS_CONFIG.MIN_STATIONARY_DISTANCE_METERS) {
    return {
      isValid: true,
      isStationaryJitter: true,
      segmentSpeedKmh: 0,
      segmentDistanceMeters: 0,
      segmentTimeSeconds: timeDeltaSeconds,
    };
  }

  return {
    isValid: true,
    isStationaryJitter: false,
    segmentSpeedKmh: Math.round(finalSpeedKmh * 10) / 10,
    segmentDistanceMeters: distanceMeters,
    segmentTimeSeconds: timeDeltaSeconds,
  };
}
