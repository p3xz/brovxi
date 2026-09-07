import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface EmptyRideIllustrationProps {
  width?: number;
  height?: number;
}

export const EmptyRideIllustration: React.FC<EmptyRideIllustrationProps> = ({
  width = 220,
  height = 140,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 160" fill="none">
      <Defs>
        <LinearGradient id="mountGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#232B3B" />
          <Stop offset="100%" stopColor="#13171F" />
        </LinearGradient>
        <LinearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#181F2C" />
          <Stop offset="100%" stopColor="#222B3A" />
        </LinearGradient>
      </Defs>

      {/* Mountain Silhouettes */}
      <Path
        d="M20 110 L70 45 L115 95 L160 30 L220 110 Z"
        fill="url(#mountGrad)"
        stroke="#2C3545"
        strokeWidth="1.5"
      />
      <Path
        d="M70 45 L85 68 L100 62 L115 95 M160 30 L175 52 L190 48 L205 85"
        stroke="#3F4C62"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Curving Road */}
      <Path
        d="M140 100 C135 110, 110 120, 90 160 L150 160 C160 130, 150 115, 145 100 Z"
        fill="url(#roadGrad)"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Center Dashed Road Markings */}
      <Path
        d="M142 104 L141 112 M138 118 L133 128 M126 136 L118 152"
        stroke={Colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Distant Beacon */}
      <Circle cx="160" cy="30" r="14" fill={Colors.primary} fillOpacity="0.12" />
      <Circle cx="160" cy="30" r="3" fill={Colors.primary} />

      {/* GPS Pin Outline */}
      <G transform="translate(110, 80) scale(0.7)">
        <Path
          d="M20 8 C13.4 8, 8 13.4, 8 20 C8 29, 20 40, 20 40 C20 40, 32 29, 32 20 C32 13.4, 26.6 8, 20 8 Z"
          fill="#1A202C"
          stroke={Colors.primary}
          strokeWidth="2"
        />
        <Circle cx="20" cy="20" r="4" fill={Colors.primary} />
      </G>
    </Svg>
  );
};
