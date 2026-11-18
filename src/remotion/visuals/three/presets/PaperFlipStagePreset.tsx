import React, { useEffect, useMemo } from 'react';
import '@react-three/fiber';
import { interpolate, spring } from 'remotion';
import { ThreeCardItem, ThreeVisualData } from '../../../../schema/storyboard';
import { createDocumentPageTexture } from '../texture-utils';

interface PaperFlipStagePresetProps {
  data: ThreeVisualData;
  frame: number;
  fps: number;
  durationInFrames: number;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

interface DossierSheetProps {
  item: ThreeCardItem;
  index: number;
  total: number;
  frame: number;
  fps: number;
  durationInFrames: number;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

const DossierSheet: React.FC<DossierSheetProps> = ({
  item,
  index,
  total,
  frame,
  fps,
  durationInFrames,
  accentColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const tex = useMemo(
    () =>
      createDocumentPageTexture({
        index,
        total,
        tag: item.label || 'ARSIP',
        title: item.title,
        summary: item.subtitle || '',
        metric: item.value,
        highlight: item.highlight,
        accentColor,
        textColor,
        fontHeading,
        fontBody,
      }),
    [
      index,
      total,
      item.label,
      item.title,
      item.subtitle,
      item.value,
      item.highlight,
      accentColor,
      textColor,
      fontHeading,
      fontBody,
    ]
  );

  useEffect(() => {
    return () => {
      tex.dispose();
    };
  }, [tex]);

  const stepFrames = Math.max(12, Math.floor((durationInFrames * 0.65) / Math.max(1, total)));
  const enter = spring({
    frame: Math.max(0, frame - index * stepFrames),
    fps,
    config: { damping: 16, stiffness: 105 },
  });

  const centerOffset = index - (total - 1) / 2;
  const fanX = isPortrait ? centerOffset * 0.42 : centerOffset * 1.35;
  const fanRotZ = -centerOffset * 0.08;
  const stackY = index * 0.045;

  const posX = interpolate(enter, [0, 1], [fanX - 1.8, fanX]);
  const posY = interpolate(enter, [0, 1], [1.4, stackY]);
  const posZ = centerOffset * 0.18;

  // Dramatic 3D page flip onto the workbench
  const flipX = interpolate(enter, [0, 1], [-Math.PI * 0.85, -0.32]);
  const flipY = interpolate(enter, [0, 1], [0.45, centerOffset * 0.05]);

  const sheetW = isPortrait ? 2.15 : 2.3;
  const sheetH = sheetW * 1.333;

  return (
    <group position={[posX, posY, posZ]} rotation={[flipX, flipY, fanRotZ]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[sheetW, sheetH, 0.035]} />
        <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[sheetW - 0.04, sheetH - 0.04]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.45}
          metalness={0.05}
          emissive={item.highlight ? accentColor : '#000000'}
          emissiveIntensity={item.highlight ? 0.06 * glowIntensity : 0}
        />
      </mesh>
    </group>
  );
};

export const PaperFlipStagePreset: React.FC<PaperFlipStagePresetProps> = ({
  data,
  frame,
  fps,
  durationInFrames,
  accentColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const sheets: ThreeCardItem[] = useMemo(() => {
    if (data.cards && data.cards.length > 0) {
      return data.cards.slice(0, 4);
    }
    return [
      {
        label: 'RINGKASAN',
        title: data.headline || 'Fakta Utama',
        subtitle: data.subheadline || 'Dokumentasi visual terstruktur',
        highlight: true,
      },
    ];
  }, [data.cards, data.headline, data.subheadline]);

  return (
    <group position={[0, 0.1, 0]}>
      {/* Dark wooden/slate workbench surface */}
      <mesh position={[0, -1.52, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 6]} />
        <meshStandardMaterial color="#090F1D" roughness={0.75} metalness={0.2} />
      </mesh>

      {sheets.map((item, idx) => (
        <DossierSheet
          key={`${item.title}-${idx}`}
          item={item}
          index={idx}
          total={sheets.length}
          frame={frame}
          fps={fps}
          durationInFrames={durationInFrames}
          accentColor={accentColor}
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
