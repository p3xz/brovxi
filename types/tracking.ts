import { Ride, TrackPoint } from './ride';

export interface LiveTrackingState {
  status: 'idle' | 'starting' | 'running' | 'paused' | 'finishing' | 'completed' | 'interrupted';
  currentRide: Ride | null;
  currentSpeedKmh: number;
  currentDistanceKm: number;
  currentDurationSeconds: number;
  currentMovingTimeSeconds: number;
  currentAvgSpeedKmh: number;
  currentMaxSpeedKmh: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    heading: number | null;
    accuracy: number | null;
    altitude: number | null;
  } | null;
  routeCoordinates: [number, number][]; // [longitude, latitude] for MapLibre GeoJSON
  recentPointsCount: number;
  lastUpdated: number;
  gpsSignalState: 'searching' | 'good' | 'poor' | 'off';
}
