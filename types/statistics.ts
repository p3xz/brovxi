export interface OverallStatistics {
  totalDistanceKm: number;
  totalRidesCount: number;
  totalDurationSeconds: number;
  totalMovingTimeSeconds: number;
  overallAverageSpeedKmh: number;
  topSpeedKmh: number;
  longestRideDistanceKm: number;
  longestRideDurationSeconds: number;
  averageRideDistanceKm: number;
  thisMonthDistanceKm: number;
}

export interface HomeStatistics {
  thisMonthKm: number;
  totalKm: number;
  totalRides: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
}

export interface PersonalRecords {
  topSpeedKmh: number;
  topSpeedRideId: string | null;
  longestDistanceKm: number;
  longestDistanceRideId: string | null;
  longestDurationSeconds: number;
  longestDurationRideId: string | null;
  highestAverageSpeedKmh: number;
  highestAverageSpeedRideId: string | null;
}
