import React, { useEffect, useMemo } from 'react';
import '@react-three/fiber';
import * as THREE from 'three';
import { spring } from 'remotion';
import { ThreeNodeItem, ThreeVisualData } from '../../../../schema/storyboard';
import { createBadgeTexture } from '../texture-utils';

interface NetworkNodesPresetProps {
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

interface ConnectionBeamProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  progress: number;
  frame: number;
  index: number;
  accentColor: string;
  glowIntensity: number;
}

const ConnectionBeam: React.FC<ConnectionBeamProps> = ({
  start,
  end,
  progress,
  frame,
  index,
  accentColor,
  glowIntensity,
}) => {
  const { midpoint, quaternion, length } = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const quat = new THREE.Quaternion();
    if (len > 0.0001) {
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    }
    return { midpoint: mid, quaternion: quat, length: len };
  }, [start, end]);

  // Animated pulse traveling along the beam
  const t = ((frame * 0.025 + index * 0.27) % 1);
  const pulsePos = useMemo(
    () => new THREE.Vector3().lerpVectors(start, end, t),
    [start, end, t]
  );

  return (
    <group scale={[progress, progress, progress]}>
      <mesh position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[0.022, 0.022, length, 12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.65 * glowIntensity}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh position={pulsePos}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive={accentColor}
          emissiveIntensity={2.0 * glowIntensity}
        />
      </mesh>
    </group>
  );
};

interface NodeLabelPlateProps {
  label: string;
  sublabel?: string;
  highlight?: boolean;
  position: [number, number, number];
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

const NodeLabelPlate: React.FC<NodeLabelPlateProps> = ({
  label,
  sublabel,
  highlight,
  position,
  bgColor,
  accentColor,
  textColor,
  fontHeading,
  fontBody,
}) => {
  const tex = useMemo(
    () =>
      createBadgeTexture({
        label: sublabel || 'NODE',
        valueText: label,
        highlight,
        bgColor,
        accentColor,
        textColor,
        fontHeading,
        fontBody,
      }),
    [label, sublabel, highlight, bgColor, accentColor, textColor, fontHeading, fontBody]
  );

  useEffect(() => {
    return () => {
      tex.dispose();
    };
  }, [tex]);

  return (
    <mesh position={position}>
      <planeGeometry args={[1.3, 0.65]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  );
};

export const NetworkNodesPreset: React.FC<NetworkNodesPresetProps> = ({
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
  const nodes: ThreeNodeItem[] = useMemo(() => {
    if (data.nodes && data.nodes.length > 0) {
      return data.nodes.slice(0, 7);
    }
    return [
      { id: 'hub', label: data.headline || 'PUSAT', sublabel: 'CORE', size: 1.3, highlight: true },
      { id: 'n1', label: 'NODE A', sublabel: 'JALUR 1', size: 0.95, highlight: false },
      { id: 'n2', label: 'NODE B', sublabel: 'JALUR 2', size: 0.95, highlight: false },
      { id: 'n3', label: 'NODE C', sublabel: 'JALUR 3', size: 0.95, highlight: false },
      { id: 'n4', label: 'NODE D', sublabel: 'JALUR 4', size: 0.95, highlight: false },
    ];
  }, [data.nodes, data.headline]);

  const hubNode = nodes[0];
  const satellites = nodes.slice(1);

  const radiusX = isPortrait ? 1.55 : 2.65;
  const radiusY = isPortrait ? 1.85 : 1.45;

  const satellitePositions = useMemo(() => {
    return satellites.map((_, idx) => {
      const angle = (idx / Math.max(1, satellites.length)) * Math.PI * 2 + Math.PI / 4;
      return new THREE.Vector3(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY,
        Math.sin(angle * 2) * 0.65
      );
    });
  }, [satellites, radiusX, radiusY]);

  const hubEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const origin = useMemo(() => new THREE.Vector3(0, 0.15, 0), []);

  return (
    <group position={[0, 0.15, 0]}>
      {/* Central Hub Sphere */}
      <group scale={[hubEnter, hubEnter, hubEnter]}>
        <mesh castShadow>
          <sphereGeometry args={[0.52 * (hubNode.size || 1), 32, 32]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.85 * glowIntensity}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Orbital Gyro Rings around Hub */}
        <mesh rotation={[Math.PI / 3, frame * 0.03, 0]}>
          <torusGeometry args={[0.88, 0.025, 16, 64]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.9 * glowIntensity}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 4, -frame * 0.025, Math.PI / 5]}>
          <torusGeometry args={[1.08, 0.018, 16, 64]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.7 * glowIntensity}
          />
        </mesh>

        <NodeLabelPlate
          label={hubNode.label}
          sublabel={hubNode.sublabel || 'CORE'}
          highlight
          position={[0, -0.95, 0.45]}
          bgColor={bgColor}
          accentColor={accentColor}
          textColor={textColor}
          fontHeading={fontHeading}
          fontBody={fontBody}
        />
      </group>

      {/* Satellites and Connection Beams */}
      {satellites.map((sat, idx) => {
        const satEnter = spring({
          frame: Math.max(0, frame - (idx + 1) * 5),
          fps,
          config: { damping: 15, stiffness: 110 },
        });
        const pos = satellitePositions[idx];
        const floatY = Math.sin(frame * 0.05 + idx * 1.3) * 0.08;
        const currentPos = new THREE.Vector3(pos.x, pos.y + floatY, pos.z);

        return (
          <group key={sat.id}>
            <ConnectionBeam
              start={new THREE.Vector3(0, 0, 0)}
              end={currentPos}
              progress={satEnter}
              frame={frame}
              index={idx}
              accentColor={sat.highlight ? accentColor : secondaryColor}
              glowIntensity={glowIntensity}
            />

            <group
              position={[currentPos.x, currentPos.y, currentPos.z]}
              scale={[satEnter, satEnter, satEnter]}
            >
              <mesh castShadow>
                <octahedronGeometry args={[0.32 * (sat.size || 1), 1]} />
                <meshStandardMaterial
                  color={sat.highlight ? accentColor : secondaryColor}
                  emissive={sat.highlight ? accentColor : secondaryColor}
                  emissiveIntensity={0.55 * glowIntensity}
                  metalness={0.5}
                  roughness={0.25}
                />
              </mesh>
              <NodeLabelPlate
                label={sat.label}
                sublabel={sat.sublabel}
                highlight={sat.highlight}
                position={[0, -0.58, 0.25]}
                bgColor={bgColor}
                accentColor={accentColor}
                textColor={textColor}
                fontHeading={fontHeading}
                fontBody={fontBody}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
};
