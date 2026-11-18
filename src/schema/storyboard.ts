import { z } from 'zod';

const HexColorSchema = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);

export const VideoConfigSchema = z.object({
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().int().min(1).max(120).default(30),
});

export const ThemeSchema = z.object({
  background: HexColorSchema.default('#0F172A'),
  accent: HexColorSchema.default('#F59E0B'),
  text: HexColorSchema.default('#F8FAFC'),
  fontHeading: z.string().min(1).default('Poppins'),
  fontBody: z.string().min(1).default('Inter'),
  cinematicOverlay: z.boolean().default(true),
});

export const SvgVisualSchema = z.object({
  type: z.literal('svg'),
  code: z.string().min(1),
});

export const HtmlVisualSchema = z.object({
  type: z.literal('html'),
  code: z.string().min(1),
});

export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const ThreePresetSchema = z.enum([
  'floating-cards',
  'isometric-blocks',
  'network-nodes',
  'paper-flip-stage',
]);

export const ThreeCameraSchema = z.object({
  from: Vec3Schema.default([0, 1.35, 6.4]),
  to: Vec3Schema.default([0, 0.55, 4.7]),
  fov: z.number().min(15).max(110).default(42),
  lookAt: Vec3Schema.default([0, 0, 0]),
});

export const ThreeLightingSchema = z.object({
  ambientIntensity: z.number().min(0).max(3).default(0.55),
  keyIntensity: z.number().min(0).max(5).default(1.65),
  rimIntensity: z.number().min(0).max(5).default(1.15),
  glowIntensity: z.number().min(0).max(3).default(0.9),
});

export const ThreeColorsSchema = z.object({
  background: HexColorSchema.optional(),
  accent: HexColorSchema.optional(),
  secondary: HexColorSchema.optional(),
  surface: HexColorSchema.optional(),
});

export const ThreeCardItemSchema = z.object({
  label: z.string().optional(),
  title: z.string().min(1),
  value: z.string().optional(),
  subtitle: z.string().optional(),
  highlight: z.boolean().default(false),
});

export const ThreeBlockItemSchema = z.object({
  label: z.string().min(1),
  value: z.number().nonnegative(),
  displayValue: z.string().optional(),
  highlight: z.boolean().default(false),
});

export const ThreeNodeItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sublabel: z.string().optional(),
  size: z.number().positive().default(1),
  highlight: z.boolean().default(false),
});

export const ThreeVisualDataSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  cards: z.array(ThreeCardItemSchema).optional(),
  blocks: z.array(ThreeBlockItemSchema).optional(),
  nodes: z.array(ThreeNodeItemSchema).optional(),
  showGrid: z.boolean().default(true),
  showParticles: z.boolean().default(true),
  autoRotateSpeed: z.number().min(-2).max(2).default(0.14),
});

export const ThreeVisualSchema = z.object({
  type: z.literal('three'),
  preset: ThreePresetSchema.default('floating-cards'),
  camera: ThreeCameraSchema.default({}),
  lighting: ThreeLightingSchema.default({}),
  colors: ThreeColorsSchema.default({}),
  data: ThreeVisualDataSchema.default({}),
});

export const VisualSchema = z.discriminatedUnion('type', [
  SvgVisualSchema,
  HtmlVisualSchema,
  ThreeVisualSchema,
]);

export const MotionTypeSchema = z.enum([
  'none',
  'zoom_in',
  'zoom_out',
  'pan_left',
  'pan_right',
]);

export const TransitionTypeSchema = z.enum(['none', 'fade', 'slide']);

export const AudioSchema = z.object({
  file: z.string().min(1, 'Path audio narasi wajib diisi'),
  transcript: z.string().min(1, 'Path file transkrip SRT wajib diisi'),
});

export const SceneSchema = z
  .object({
    id: z.number().int().positive(),
    start: z.number().nonnegative('Waktu mulai tidak boleh negatif'),
    end: z.number().positive('Waktu selesai harus lebih dari 0'),
    visual: VisualSchema,
    on_screen_text: z.string().nullable().optional(),
    motion: MotionTypeSchema.default('zoom_in'),
    transition: TransitionTypeSchema.default('fade'),
  })
  .superRefine((scene, ctx) => {
    if (scene.end <= scene.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end'],
        message: 'end harus lebih besar dari start',
      });
    }
  });

export const StoryboardSchema = z
  .object({
    title: z.string().min(1),
    language: z.string().min(2).max(10).default('id'),
    video: VideoConfigSchema.default({}),
    theme: ThemeSchema.default({}),
    audio: AudioSchema,
    scenes: z.array(SceneSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const ids = new Set<number>();
    data.scenes.forEach((scene, index) => {
      if (ids.has(scene.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scenes', index, 'id'],
          message: `ID adegan duplikat: ${scene.id}`,
        });
      }
      ids.add(scene.id);
      if (scene.id !== index + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scenes', index, 'id'],
          message: 'ID adegan harus berurutan mulai dari 1',
        });
      }
      if (index > 0 && scene.start < data.scenes[index - 1].end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scenes', index, 'start'],
          message: 'Adegan tidak boleh saling tumpang tindih',
        });
      }
    });
  });

export type VideoConfig = z.infer<typeof VideoConfigSchema>;
export type ThemeConfig = z.infer<typeof ThemeSchema>;
export type Vec3 = z.infer<typeof Vec3Schema>;
export type ThreePreset = z.infer<typeof ThreePresetSchema>;
export type ThreeCameraConfig = z.infer<typeof ThreeCameraSchema>;
export type ThreeLightingConfig = z.infer<typeof ThreeLightingSchema>;
export type ThreeColorsConfig = z.infer<typeof ThreeColorsSchema>;
export type ThreeCardItem = z.infer<typeof ThreeCardItemSchema>;
export type ThreeBlockItem = z.infer<typeof ThreeBlockItemSchema>;
export type ThreeNodeItem = z.infer<typeof ThreeNodeItemSchema>;
export type ThreeVisualData = z.infer<typeof ThreeVisualDataSchema>;
export type ThreeVisualConfig = z.infer<typeof ThreeVisualSchema>;
export type VisualConfig = z.infer<typeof VisualSchema>;
export type MotionType = z.infer<typeof MotionTypeSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
export type SceneInput = z.infer<typeof SceneSchema>;
export type StoryboardInput = z.infer<typeof StoryboardSchema>;

export interface ResolvedScene extends SceneInput {
  startFrame: number;
  endFrame: number;
}

export interface SubtitleCue {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface ResolvedProps {
  title: string;
  language: string;
  video: VideoConfig;
  theme: ThemeConfig;
  audioSrc: string;
  subtitles: SubtitleCue[];
  scenes: ResolvedScene[];
  totalDurationInFrames: number;
  transitionDurationInFrames: number;
  enableSubtitles: boolean;
}

export const ResolvedSceneSchema = SceneSchema.innerType().extend({
  startFrame: z.number(),
  endFrame: z.number(),
});

export const SubtitleCueSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
});

export const ResolvedPropsSchema = z.object({
  title: z.string(),
  language: z.string(),
  video: VideoConfigSchema,
  theme: ThemeSchema,
  audioSrc: z.string(),
  subtitles: z.array(SubtitleCueSchema),
  scenes: z.array(ResolvedSceneSchema),
  totalDurationInFrames: z.number(),
  transitionDurationInFrames: z.number(),
  enableSubtitles: z.boolean(),
});
