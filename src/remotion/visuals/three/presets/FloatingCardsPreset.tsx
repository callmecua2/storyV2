import React, { useEffect, useMemo } from 'react';
import '@react-three/fiber';
import { spring } from 'remotion';
import { ThreeCardItem, ThreeVisualData } from '../../../../schema/storyboard';
import { createCardTexture } from '../texture-utils';

interface FloatingCardsPresetProps {
  data: ThreeVisualData;
  frame: number;
  fps: number;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

interface CardMeshProps {
  item: ThreeCardItem;
  index: number;
  total: number;
  frame: number;
  fps: number;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  glowIntensity: number;
  isPortrait: boolean;
}

const CardMesh: React.FC<CardMeshProps> = ({
  item,
  index,
  total,
  frame,
  fps,
  bgColor,
  accentColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const texture = useMemo(
    () =>
      createCardTexture({
        label: item.label || `0${index + 1}`,
        title: item.title,
        value: item.value,
        subtitle: item.subtitle,
        highlight: item.highlight,
        bgColor,
        accentColor,
        textColor,
        fontHeading,
        fontBody,
      }),
    [
      item.label,
      item.title,
      item.value,
      item.subtitle,
      item.highlight,
      index,
      bgColor,
      accentColor,
      textColor,
      fontHeading,
      fontBody,
    ]
  );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  const enter = spring({
    frame: Math.max(0, frame - index * 7),
    fps,
    config: { damping: 15, stiffness: 110 },
  });

  const centerOffset = index - (total - 1) / 2;
  const spreadX = isPortrait ? 0.55 : 2.15;
  const spreadY = isPortrait ? -0.95 : 0.15;

  const targetX = centerOffset * spreadX;
  const targetY = centerOffset * spreadY + Math.sin(frame * 0.05 + index * 1.4) * 0.08;
  const targetZ = -Math.abs(centerOffset) * 0.65 + (item.highlight ? 0.35 : 0);

  const posX = targetX * enter;
  const posY = (1 - enter) * -2.2 + targetY;
  const posZ = targetZ - (1 - enter) * 1.5;

  const rotY = -centerOffset * (isPortrait ? 0.12 : 0.24) + Math.cos(frame * 0.03 + index) * 0.03;
  const rotX = (1 - enter) * 0.35 + Math.sin(frame * 0.04 + index) * 0.02;

  const cardW = isPortrait ? 2.45 : 2.65;
  const cardH = cardW * 0.625;

  return (
    <group position={[posX, posY, posZ]} rotation={[rotX, rotY, 0]}>
      {/* Main slab body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[cardW, cardH, 0.11]} />
        <meshStandardMaterial
          color={item.highlight ? accentColor : '#1E293B'}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>

      {/* Front high-DPI procedural screen face */}
      <mesh position={[0, 0, 0.058]}>
        <planeGeometry args={[cardW - 0.06, cardH - 0.06]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.1}
          emissive={item.highlight ? accentColor : '#000000'}
          emissiveIntensity={item.highlight ? 0.08 * glowIntensity : 0}
        />
      </mesh>

      {/* Glowing top accent edge strip */}
      <mesh position={[0, cardH / 2 + 0.015, 0]}>
        <boxGeometry args={[cardW * 0.65, 0.025, 0.12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={item.highlight ? 1.4 * glowIntensity : 0.45 * glowIntensity}
        />
      </mesh>
    </group>
  );
};

export const FloatingCardsPreset: React.FC<FloatingCardsPresetProps> = ({
  data,
  frame,
  fps,
  bgColor,
  accentColor,
  textColor,
  fontHeading,
  fontBody,
  glowIntensity,
  isPortrait,
}) => {
  const cards: ThreeCardItem[] = useMemo(() => {
    if (data.cards && data.cards.length > 0) {
      return data.cards.slice(0, 4);
    }
    return [
      {
        label: 'SOROTAN UTAMA',
        title: data.headline || 'Analisis Visual 3D',
        subtitle: data.subheadline || 'Dirender secara prosedural dengan WebGL',
        highlight: true,
      },
    ];
  }, [data.cards, data.headline, data.subheadline]);

  return (
    <group position={[0, 0.15, 0]}>
      {cards.map((item, idx) => (
        <CardMesh
          key={`${item.title}-${idx}`}
          item={item}
          index={idx}
          total={cards.length}
          frame={frame}
          fps={fps}
          bgColor={bgColor}
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
