import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ride } from '../types/ride';
import { Colors } from '../constants/theme';
import { formatDistance, formatDuration, formatSpeed } from '../services/distance';
import { ChevronRight } from 'lucide-react-native';

interface RideCardProps {
  ride: Ride;
  onPress: () => void;
  unit?: 'km' | 'mi';
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  onPress,
  unit = 'km',
}) => {
  const dateFormatted = new Date(ride.start_time).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const distanceParts = formatDistance(ride.distance, unit).split(' ');
  const distanceVal = distanceParts[0];
  const distanceUnit = distanceParts[1] || unit.toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{dateFormatted.toUpperCase()}</Text>
        <ChevronRight size={16} color={Colors.textMuted} />
      </View>

      <View style={styles.cardBody}>
        {/* Large Instrument Distance */}
        <View style={styles.distanceBlock}>
          <Text style={styles.distanceValue}>{distanceVal}</Text>
          <Text style={styles.distanceUnit}>{distanceUnit.toUpperCase()}</Text>
        </View>

        {/* Telemetry Metrics */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>TIME</Text>
            <Text style={styles.metaValue}>{formatDuration(ride.duration)}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>AVG</Text>
            <Text style={styles.metaValue}>{formatSpeed(ride.average_speed, unit)}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>MAX</Text>
            <Text style={styles.metaValue}>{formatSpeed(ride.max_speed, unit)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  distanceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  distanceValue: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  distanceUnit: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaCol: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metaDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.surfaceBorder,
  },
});
