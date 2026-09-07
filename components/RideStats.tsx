import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/theme';
import { formatDistance, formatDuration, formatStopwatch, formatSpeed } from '../services/distance';

interface RideStatsProps {
  distanceKm: number;
  durationSeconds: number;
  movingTimeSeconds?: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  unit?: 'km' | 'mi';
  mode?: 'active' | 'summary';
}

export const RideStats: React.FC<RideStatsProps> = ({
  distanceKm,
  durationSeconds,
  movingTimeSeconds,
  avgSpeedKmh,
  maxSpeedKmh,
  unit = 'km',
  mode = 'active',
}) => {
  const speedUnit = unit === 'mi' ? 'mph' : 'km/h';

  if (mode === 'active') {
    return (
      <View style={styles.gridContainer}>
        {/* Distance Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <View style={styles.valUnitRow}>
            <Text style={styles.statValue}>{formatDistance(distanceKm, unit).split(' ')[0]}</Text>
            <Text style={styles.statUnit}>{unit.toUpperCase()}</Text>
          </View>
        </View>

        {/* Duration Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statValue}>{formatStopwatch(durationSeconds)}</Text>
        </View>

        {/* Avg Speed Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AVG SPEED</Text>
          <View style={styles.valUnitRow}>
            <Text style={styles.statValue}>{Math.round(avgSpeedKmh)}</Text>
            <Text style={styles.statUnit}>{speedUnit.toUpperCase()}</Text>
          </View>
        </View>

        {/* Top Speed Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MAX SPEED</Text>
          <View style={styles.valUnitRow}>
            <Text style={styles.statValue}>{Math.round(maxSpeedKmh)}</Text>
            <Text style={styles.statUnit}>{speedUnit.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Summary / Detail Mode
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL DISTANCE</Text>
          <Text style={styles.summaryPrimaryValue}>{formatDistance(distanceKm, unit)}</Text>
        </View>

        <View style={styles.summaryDividerVert} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL DURATION</Text>
          <Text style={styles.summaryPrimaryValue}>{formatDuration(durationSeconds)}</Text>
        </View>
      </View>

      <View style={styles.summaryDividerHoriz} />

      <View style={styles.summaryThreeCol}>
        {movingTimeSeconds !== undefined && (
          <>
            <View style={styles.colItem}>
              <Text style={styles.colLabel}>MOVING TIME</Text>
              <Text style={styles.colValue}>{formatDuration(movingTimeSeconds)}</Text>
            </View>
            <View style={styles.colDivider} />
          </>
        )}

        <View style={styles.colItem}>
          <Text style={styles.colLabel}>AVG SPEED</Text>
          <Text style={styles.colValue}>{formatSpeed(avgSpeedKmh, unit)}</Text>
        </View>

        <View style={styles.colDivider} />

        <View style={styles.colItem}>
          <Text style={styles.colLabel}>TOP SPEED</Text>
          <Text style={styles.colValue}>{formatSpeed(maxSpeedKmh, unit)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  statUnit: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryPrimaryValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  summaryDividerVert: {
    width: 1,
    height: 36,
    backgroundColor: Colors.surfaceBorder,
    marginHorizontal: 12,
  },
  summaryDividerHoriz: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 14,
  },
  summaryThreeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colItem: {
    flex: 1,
  },
  colLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  colValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.surfaceBorder,
    marginHorizontal: 8,
  },
});
