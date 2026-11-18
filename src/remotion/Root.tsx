import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { ResolvedProps, ResolvedPropsSchema } from '../schema/storyboard';

const defaultProps: ResolvedProps = {
  title: 'Preview Video 3D',
  language: 'id',
  video: { width: 1920, height: 1080, fps: 30 },
  theme: {
    background: '#0F172A',
    accent: '#F59E0B',
    text: '#F8FAFC',
    fontHeading: 'Poppins',
    fontBody: 'Inter',
    cinematicOverlay: true,
  },
  audioSrc: 'audio/narration.mp3',
  subtitles: [],
  scenes: [
    {
      id: 1,
      start: 0,
      end: 4,
      visual: {
        type: 'three',
        preset: 'floating-cards',
        camera: {
          from: [0, 1.35, 6.4],
          to: [0, 0.55, 4.7],
          fov: 42,
          lookAt: [0, 0, 0],
        },
        lighting: {
          ambientIntensity: 0.55,
          keyIntensity: 1.65,
          rimIntensity: 1.15,
          glowIntensity: 0.9,
        },
        colors: {},
        data: {
          headline: 'HYBRID 3D ENGINE',
          subheadline: 'Remotion + Three.js WebGL',
          cards: [
            {
              label: '01 / DETERMINISTIC',
              title: 'Storyboard JSON',
              value: '100% Synced',
              subtitle: 'Kontrol penuh lewat skema deklaratif',
              highlight: true,
            },
            {
              label: '02 / RENDERER',
              title: 'WebGL 3D Stage',
              value: '60 / 30 FPS',
              subtitle: 'Pencahayaan, bayangan & kamera dinamis',
              highlight: false,
            },
          ],
          showGrid: true,
          showParticles: true,
          autoRotateSpeed: 0.14,
        },
      },
      on_screen_text: 'Preview Mode 3D',
      motion: 'zoom_in',
      transition: 'fade',
      startFrame: 0,
      endFrame: 120,
    },
  ],
  totalDurationInFrames: 120,
  transitionDurationInFrames: 15,
  enableSubtitles: true,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MainVideo"
    component={VideoComposition as unknown as React.ComponentType<Record<string, unknown>>}
    schema={ResolvedPropsSchema}
    durationInFrames={defaultProps.totalDurationInFrames}
    fps={defaultProps.video.fps}
    width={defaultProps.video.width}
    height={defaultProps.video.height}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: props.totalDurationInFrames,
      fps: props.video.fps,
      width: props.video.width,
      height: props.video.height,
    })}
  />
);
