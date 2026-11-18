import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface CinematicOverlayProps {
  accentColor: string;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  // Deterministic subtle grain shift per frame without external assets
  const shiftX = ((frame * 37) % 96) - 48;
  const shiftY = ((frame * 53) % 96) - 48;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Subtle radial edge vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 56%, rgba(2,6,23,0.48) 100%)',
        }}
      />
      {/* Top hairline accent glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}88 50%, transparent 100%)`,
        }}
      />
      {/* Deterministic fine film grain pattern */}
      <div
        style={{
          position: 'absolute',
          inset: -64,
          opacity: 0.035,
          transform: `translate3d(${shiftX}px, ${shiftY}px, 0)`,
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 0), radial-gradient(rgba(255,255,255,0.55) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />
    </AbsoluteFill>
  );
};
