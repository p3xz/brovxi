import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface GpsIllustrationProps {
  width?: number;
  height?: number;
  status?: 'searching' | 'permission' | 'disabled';
}

export const GpsIllustration: React.FC<GpsIllustrationProps> = ({
  width = 160,
  height = 140,
  status = 'searching',
}) => {
  const accent = status === 'disabled' ? Colors.danger : Colors.primary;

  return (
    <Svg width={width} height={height} viewBox="0 0 160 140" fill="none">
      <Defs>
        <LinearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0.0" />
        </LinearGradient>
      </Defs>

      {/* Pulsing Radar Waves */}
      <Circle cx="80" cy="70" r="55" stroke={accent} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.3" />
      <Circle cx="80" cy="70" r="40" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />
      <Circle cx="80" cy="70" r="25" fill="url(#pulseGlow)" stroke={accent} strokeWidth="2" />

      {/* Center Satellite / Location Beacon */}
      <Circle cx="80" cy="70" r="9" fill="#141822" stroke={accent} strokeWidth="2.5" />
      <Circle cx="80" cy="70" r="4" fill={accent} />

      {/* Orbiting Satellite Motif */}
      <G transform="translate(105, 35) rotate(45)">
        <Rect x="-6" y="-3" width="12" height="6" rx="1.5" fill="#232B3B" stroke="#3F4C62" strokeWidth="1" />
        <Path d="M-12 0 L-6 0 M6 0 L12 0" stroke={accent} strokeWidth="1.5" />
        <Rect x="-16" y="-5" width="4" height="10" rx="1" fill="#181F2C" stroke={accent} strokeWidth="1" />
        <Rect x="12" y="-5" width="4" height="10" rx="1" fill="#181F2C" stroke={accent} strokeWidth="1" />
      </G>

      {/* Crosshairs */}
      <Path d="M80 18 L80 28 M80 112 L80 122 M28 70 L38 70 M122 70 L132 70" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};
