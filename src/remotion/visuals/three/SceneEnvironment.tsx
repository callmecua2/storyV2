import React, { useEffect, useMemo } from 'react';
import '@react-three/fiber';
import * as THREE from 'three';
import { ThreeLightingConfig } from '../../../schema/storyboard';
import { createGridFloorTexture } from './texture-utils';

interface StudioLightingProps {
  lighting: ThreeLightingConfig;
  accentColor: string;
  secondaryColor: string;
}

export const StudioLighting: React.FC<StudioLightingProps> = ({
  lighting,
  accentColor,
  secondaryColor,
}) => {
  return (
    <>
      <ambientLight intensity={lighting.ambientIntensity} />
      <hemisphereLight args={['#e2e8f0', '#020617', 0.45]} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={lighting.keyIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      <pointLight
        position={[-4.5, 3.5, -3.5]}
        intensity={lighting.rimIntensity * 2.2}
        color={accentColor}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[4.5, 2.2, 3.5]}
        intensity={lighting.rimIntensity * 1.4}
        color={secondaryColor}
        distance={16}
        decay={2}
      />
    </>
  );
};

interface StageFloorProps {
  bgColor: string;
  accentColor: string;
  y?: number;
}

export const StageFloor: React.FC<StageFloorProps> = ({
  bgColor,
  accentColor,
  y = -1.65,
}) => {
  const gridTex = useMemo(
    () => createGridFloorTexture(accentColor, bgColor),
    [accentColor, bgColor]
  );

  useEffect(() => {
    return () => {
      gridTex.dispose();
    };
  }, [gridTex]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[36, 36]} />
      <meshStandardMaterial
        map={gridTex}
        roughness={0.55}
        metalness={0.35}
      />
    </mesh>
  );
};

interface AmbientParticlesProps {
  frame: number;
  accentColor: string;
  count?: number;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  frame,
  accentColor,
  count = 65,
}) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random distribution
      const s1 = Math.sin(i * 12.9898) * 43758.5453;
      const s2 = Math.sin(i * 78.233) * 43758.5453;
      const s3 = Math.sin(i * 39.425) * 43758.5453;
      const r1 = s1 - Math.floor(s1);
      const r2 = s2 - Math.floor(s2);
      const r3 = s3 - Math.floor(s3);

      arr[i * 3] = (r1 - 0.5) * 14;
      arr[i * 3 + 1] = (r2 - 0.3) * 8;
      arr[i * 3 + 2] = (r3 - 0.5) * 12;
    }
    return arr;
  }, [count]);

  const driftY = Math.sin(frame * 0.02) * 0.18;
  const rotY = frame * 0.0025;

  return (
    <points position={[0, driftY, 0]} rotation={[0, rotY, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color={accentColor}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
};
