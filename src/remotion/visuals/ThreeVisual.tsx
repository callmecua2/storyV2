import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import '@react-three/fiber';
import * as THREE from 'three';
import { MotionType, ThemeConfig, ThreeVisualConfig } from '../../schema/storyboard';
import { AmbientParticles, StageFloor, StudioLighting } from './three/SceneEnvironment';
import { FloatingCardsPreset } from './three/presets/FloatingCardsPreset';
import { IsometricBlocksPreset } from './three/presets/IsometricBlocksPreset';
import { NetworkNodesPreset } from './three/presets/NetworkNodesPreset';
import { PaperFlipStagePreset } from './three/presets/PaperFlipStagePreset';

interface ThreeVisualProps {
  visual: ThreeVisualConfig;
  theme: ThemeConfig;
  motion: MotionType;
}

interface CameraRigProps {
  visual: ThreeVisualConfig;
  motion: MotionType;
  progress: number;
  frame: number;
  fps: number;
  aspect: number;
}

const CameraRig: React.FC<CameraRigProps> = ({
  visual,
  motion,
  progress,
  frame,
  fps,
  aspect,
}) => {
  const { camera } = useThree();

  // Smooth ease-in-out curve for camera interpolation
  const eased = progress * progress * (3 - 2 * progress);

  const baseFrom = useMemo(() => new THREE.Vector3(...visual.camera.from), [visual.camera.from]);
  const baseTo = useMemo(() => new THREE.Vector3(...visual.camera.to), [visual.camera.to]);
  const lookAtTarget = useMemo(() => new THREE.Vector3(...visual.camera.lookAt), [visual.camera.lookAt]);

  const pos = useMemo(() => {
    const p = new THREE.Vector3().lerpVectors(baseFrom, baseTo, eased);

    // Apply subtle motion modifier in true 3D space instead of CSS scaling
    switch (motion) {
      case 'zoom_in':
        p.lerp(lookAtTarget, interpolate(progress, [0, 1], [0, 0.08]));
        break;
      case 'zoom_out':
        p.lerp(lookAtTarget, interpolate(progress, [0, 1], [0.08, 0]));
        break;
      case 'pan_left':
        p.x += interpolate(progress, [0, 1], [0.45, -0.45]);
        break;
      case 'pan_right':
        p.x += interpolate(progress, [0, 1], [-0.45, 0.45]);
        break;
      default:
        break;
    }

    // Gentle orbital drift if autoRotateSpeed is enabled
    const angle = (frame / Math.max(1, fps)) * visual.data.autoRotateSpeed;
    if (Math.abs(angle) > 0.0001) {
      const offset = p.clone().sub(lookAtTarget);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      p.copy(lookAtTarget).add(offset);
    }

    // Aspect-ratio compensation so vertical 9:16 videos frame 3D subjects cleanly
    if (aspect < 1) {
      const portraitScale = Math.min(1.52, 0.84 / Math.max(0.45, aspect));
      const offset = p.clone().sub(lookAtTarget).multiplyScalar(portraitScale);
      p.copy(lookAtTarget).add(offset);
    }

    return p;
  }, [
    baseFrom,
    baseTo,
    eased,
    motion,
    progress,
    lookAtTarget,
    frame,
    fps,
    visual.data.autoRotateSpeed,
    aspect,
  ]);

  camera.position.copy(pos);
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== visual.camera.fov) {
    camera.fov = visual.camera.fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(lookAtTarget);

  return null;
};

export const ThreeVisual: React.FC<ThreeVisualProps> = ({ visual, theme, motion }) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bgColor = visual.colors.background || theme.background;
  const accentColor = visual.colors.accent || theme.accent;
  const secondaryColor = visual.colors.secondary || '#38BDF8';
  const textColor = theme.text;
  const aspect = width / Math.max(1, height);
  const isPortrait = aspect < 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: visual.camera.from,
          fov: visual.camera.fov,
          near: 0.1,
          far: 100,
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 9, 24]} />

        <CameraRig
          visual={visual}
          motion={motion}
          progress={progress}
          frame={frame}
          fps={fps}
          aspect={aspect}
        />

        <StudioLighting
          lighting={visual.lighting}
          accentColor={accentColor}
          secondaryColor={secondaryColor}
        />

        {visual.data.showGrid && <StageFloor bgColor={bgColor} accentColor={accentColor} />}

        {visual.data.showParticles && (
          <AmbientParticles frame={frame} accentColor={accentColor} />
        )}

        {visual.preset === 'floating-cards' && (
          <FloatingCardsPreset
            data={visual.data}
            frame={frame}
            fps={fps}
            bgColor={bgColor}
            accentColor={accentColor}
            textColor={textColor}
            fontHeading={theme.fontHeading}
            fontBody={theme.fontBody}
            glowIntensity={visual.lighting.glowIntensity}
            isPortrait={isPortrait}
          />
        )}

        {visual.preset === 'isometric-blocks' && (
          <IsometricBlocksPreset
            data={visual.data}
            frame={frame}
            fps={fps}
            bgColor={bgColor}
            accentColor={accentColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
            fontHeading={theme.fontHeading}
            fontBody={theme.fontBody}
            glowIntensity={visual.lighting.glowIntensity}
            isPortrait={isPortrait}
          />
        )}

        {visual.preset === 'network-nodes' && (
          <NetworkNodesPreset
            data={visual.data}
            frame={frame}
            fps={fps}
            bgColor={bgColor}
            accentColor={accentColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
            fontHeading={theme.fontHeading}
            fontBody={theme.fontBody}
            glowIntensity={visual.lighting.glowIntensity}
            isPortrait={isPortrait}
          />
        )}

        {visual.preset === 'paper-flip-stage' && (
          <PaperFlipStagePreset
            data={visual.data}
            frame={frame}
            fps={fps}
            durationInFrames={durationInFrames}
            accentColor={accentColor}
            textColor={textColor}
            fontHeading={theme.fontHeading}
            fontBody={theme.fontBody}
            glowIntensity={visual.lighting.glowIntensity}
            isPortrait={isPortrait}
          />
        )}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
