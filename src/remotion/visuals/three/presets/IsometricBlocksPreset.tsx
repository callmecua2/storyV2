import React, { useEffect, useMemo } from 'react';
import '@react-three/fiber';
import { spring } from 'remotion';
import { ThreeBlockItem, ThreeVisualData } from '../../../../schema/storyboard';
import { createBadgeTexture } from '../texture-utils';

interface IsometricBlocksPresetProps {
  data: ThreeVisualData;
  frame: number;
  fps: number;
  bgColor: string;
  accentColor: string;
  secondaryColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

interface PillarProps {
  item: ThreeBlockItem;
  index: number;
  total: number;
  maxValue: number;
  frame: number;
  fps: number;
  bgColor: string;
  accentColor: string;
  secondaryColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

const IsometricPillar: React.FC<PillarProps> = ({
  item,
  index,
  total,
  maxValue,
  frame,
  fps,
  bgColor,
  accentColor,
  secondaryColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const badgeTex = useMemo(
    () =>
      createBadgeTexture({
        label: item.label,
        valueText: item.displayValue || String(item.value),
        highlight: item.highlight,
        bgColor,
        accentColor,
        textColor,
        fontHeading,
        fontBody,
      }),
    [
      item.label,
      item.displayValue,
      item.value,
      item.highlight,
      bgColor,
      accentColor,
      textColor,
      fontHeading,
      fontBody,
    ]
  );

  useEffect(() => {
    return () => {
      badgeTex.dispose();
    };
  }, [badgeTex]);

  const grow = spring({
    frame: Math.max(0, frame - index * 6),
    fps,
    config: { damping: 14, stiffness: 95 },
  });

  const normalized = maxValue > 0 ? Math.max(0.18, item.value / maxValue) : 0.5;
  const maxHeight = isPortrait ? 3.1 : 2.8;
  const targetHeight = normalized * maxHeight;
  const currentHeight = Math.max(0.08, targetHeight * grow);

  const spacing = isPortrait ? 1.15 : 1.55;
  const centerOffset = index - (total - 1) / 2;
  const x = centerOffset * spacing;
  const z = (index % 2 === 0 ? 1 : -1) * 0.25;
  const baseY = -1.45;

  const pillarColor = item.highlight ? accentColor : secondaryColor;

  return (
    <group position={[x, baseY, z]}>
      {/* Pedestal base */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.12, 0.92]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Extruded 3D bar */}
      <mesh position={[0, 0.12 + currentHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, currentHeight, 0.76]} />
        <meshStandardMaterial
          color={pillarColor}
          metalness={0.45}
          roughness={0.25}
          emissive={item.highlight ? accentColor : '#000000'}
          emissiveIntensity={item.highlight ? 0.22 * glowIntensity : 0}
        />
      </mesh>

      {/* Luminous top cap */}
      <mesh position={[0, 0.14 + currentHeight, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={(item.highlight ? 1.4 : 0.6) * glowIntensity}
        />
      </mesh>

      {/* Floating data plate above pillar */}
      <mesh
        position={[0, 0.68 + currentHeight + Math.sin(frame * 0.06 + index) * 0.04, 0.15]}
        rotation={[-0.12, 0, 0]}
      >
        <planeGeometry args={[1.28, 0.64]} />
        <meshBasicMaterial map={badgeTex} transparent opacity={Math.min(1, grow * 1.2)} />
      </mesh>
    </group>
  );
};

export const IsometricBlocksPreset: React.FC<IsometricBlocksPresetProps> = ({
  data,
  frame,
  fps,
  bgColor,
  accentColor,
  secondaryColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const blocks: ThreeBlockItem[] = useMemo(() => {
    if (data.blocks && data.blocks.length > 0) {
      return data.blocks.slice(0, 5);
    }
    return [
      { label: 'TAHAP 1', value: 35, displayValue: '35%', highlight: false },
      { label: 'TAHAP 2', value: 68, displayValue: '68%', highlight: false },
      { label: 'PUNCAK', value: 100, displayValue: '100%', highlight: true },
    ];
  }, [data.blocks]);

  const maxValue = useMemo(
    () => Math.max(...blocks.map((b) => b.value), 1),
    [blocks]
  );

  return (
    <group rotation={[0, Math.sin(frame * 0.015) * 0.18, 0]}>
      {/* Stage platform plinth */}
      <mesh position={[0, -1.55, 0]} receiveShadow>
        <boxGeometry args={[isPortrait ? 4.8 : 7.6, 0.16, 3.2]} />
        <meshStandardMaterial color="#0B1221" metalness={0.75} roughness={0.35} />
      </mesh>

      {blocks.map((item, idx) => (
        <IsometricPillar
          key={`${item.label}-${idx}`}
          item={item}
          index={idx}
          total={blocks.length}
          maxValue={maxValue}
          frame={frame}
          fps={fps}
          bgColor={bgColor}
          accentColor={accentColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          fontHeading={fontHeading}
          fontBody={fontBody}
          glowIntensity={glowIntensity}
          isPortrait={isPortrait}
        />
      ))}
    </group>
  );
};
