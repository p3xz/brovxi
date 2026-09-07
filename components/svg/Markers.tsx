import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { Colors } from '../../constants/theme';

export const StartMarker: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="14" fill={Colors.primary} fillOpacity="0.18" />
    <Circle cx="16" cy="16" r="9" fill={Colors.surface} stroke={Colors.primary} strokeWidth="2.5" />
    <Circle cx="16" cy="16" r="4" fill={Colors.text} />
  </Svg>
);

export const EndMarker: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="14" fill={Colors.danger} fillOpacity="0.18" />
    <Circle cx="16" cy="16" r="9" fill={Colors.surface} stroke={Colors.danger} strokeWidth="2.5" />
    <Polygon points="13,13 19,13 16,19" fill={Colors.text} />
  </Svg>
);

export const LiveRiderMarker: React.FC<{ size?: number; heading?: number | null }> = ({
  size = 36,
  heading = 0,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    style={{ transform: [{ rotate: `${heading ?? 0}deg` }] }}
  >
    <Defs>
      <LinearGradient id="beamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.6" />
        <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.0" />
      </LinearGradient>
    </Defs>
    {/* Heading Beam / Cone */}
    <Path d="M20 20 L8 0 L32 0 Z" fill="url(#beamGrad)" />
    {/* Outer Glow */}
    <Circle cx="20" cy="20" r="14" fill={Colors.primary} fillOpacity="0.25" />
    {/* Rider Beacon Core */}
    <Circle cx="20" cy="20" r="9" fill={Colors.primary} stroke="#FFFFFF" strokeWidth="2" />
    {/* Center Pointer */}
    <Path d="M20 14 L23 23 L20 21 L17 23 Z" fill={Colors.surface} />
  </Svg>
);
