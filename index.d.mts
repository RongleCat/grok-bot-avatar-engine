export const AVATAR_ALGORITHM_VERSION: 'grok-bot-0.70.2';

export type AvatarShape =
  | 'blob' | 'pebble' | 'bean' | 'egg' | 'squircle' | 'tablet' | 'capsule' | 'cylinder'
  | 'hex' | 'gem' | 'crystal' | 'wedge' | 'shield' | 'dome' | 'arch' | 'cloud' | 'teardrop'
  | 'leaf' | 'square' | 'sparkle' | 'clover' | 'flower' | 'heart' | 'house' | 'star';

export type AvatarColor =
  | 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green'
  | 'cyan' | 'blue' | 'violet' | 'magenta' | 'gray';

export type AvatarTheme = 'light' | 'dark';

export interface DerivedAvatar {
  hash: number;
  shapeHash: number;
  random: number;
}

export interface AvatarInput {
  agentId: string;
  avatarShape?: string | null;
  avatarColor?: string | null;
  avatarUrl?: string | null;
  avatarDataUrl?: string | null;
  avatarVersion?: string | null;
}

export interface ResolvedAvatar {
  algorithmVersion: typeof AVATAR_ALGORITHM_VERSION;
  agentId: string;
  kind: 'picture' | 'character';
  shape: AvatarShape;
  color: AvatarColor;
  baseHex: string;
  lightHex: string;
  darkHex: string;
  sources: { shape: 'explicit' | 'id-default'; color: 'explicit' | 'id-default' };
  picture: { url: string | null; version: string | null } | null;
  hash: number;
  shapeHash: number;
  shapeIndex: number;
  colorIndex: number;
}

export interface RenderOptions extends Partial<AvatarInput> {
  shape?: string;
  color?: string;
  ink?: string;
  theme?: AvatarTheme;
  state?: string;
  time?: number;
  size?: number;
  main?: boolean;
  compact?: boolean;
  reducedMotion?: boolean;
  id?: string;
  forceCharacter?: boolean;
}

export interface AvatarHandle {
  setState(name: string): void;
  update(next: RenderOptions): void;
  destroy(): void;
}

export interface Pose {
  state: string;
  clip: string;
  face: string;
  morph: string | null;
  x: number;
  y: number;
  turn: number;
  yaw: number;
  scale: number;
  squashX: number;
  squashY: number;
  blink: number;
  look: number;
  eyeScaleX: number;
  eyeScaleY: number;
  tilt: number;
}

export interface EyeSeat {
  width: number;
  height: number;
  gap: number;
  shiftY: number;
  squashX: number;
}

export interface StateSpec {
  clips: readonly string[];
  compactClips?: readonly string[];
  face?: string;
  morph?: string;
  next?: string;
  holdSeconds?: number;
}

export function hashBotId(key: string): number;
export function deriveDefaultAvatar(key: string): DerivedAvatar;
export function resolveAvatar(input: string | AvatarInput): ResolvedAvatar;
export interface Appearance {
  shape: string;
  color: string;
  ink: string;
  picture: { url: string | null; version: string | null } | null;
  kind?: 'picture' | 'character';
  baseHex?: string;
  lightHex?: string;
  darkHex?: string;
}

export function appearanceOf(options: string | RenderOptions): Appearance;
export function renderAvatarSvg(options?: RenderOptions): string;
export function createAvatar(element: HTMLElement, options?: RenderOptions): AvatarHandle;
export function poseAt(state: string, time: number, options?: { compact?: boolean }): Pose;
export function bodyPath(shape: string): string;
export function outlineSamples(shape: string): Array<[number, number]>;
export function toBody(shape: string): string;
export function eyeSeat(body: string): EyeSeat;
export function inkFor(name: string, theme?: AvatarTheme): string;

export const DEFAULT_SHAPES: readonly ['blob', 'pebble', 'squircle', 'tablet', 'wedge', 'hex', 'cloud', 'teardrop'];
export const SHAPES: readonly AvatarShape[];
export const BODIES: readonly string[];
export const FACES: readonly string[];
export const STATES: Readonly<Record<string, StateSpec>>;
export const DEFAULT_COLORS: readonly ['brown', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta', 'gray'];
export const PALETTE: Readonly<Record<AvatarColor, { baseHex: string; lightHex: string; darkHex: string }>>;
export const EYE_SEATS: Readonly<Record<string, EyeSeat>>;
export const EYE_REFERENCE: Readonly<{ width: number; height: number; gap: number }>;
export const EYE_UNIT: Readonly<{ width: number; height: number; gap: number }>;
export const CANVAS: Readonly<{ center: number; target: number }>;
export const CLIP_NAMES: readonly string[];
export const BADGE_SPEC: Readonly<{ disc: number; cutoutExtra: number; color: string; star: string; hairline: string }>;
export const VIEWBOX: number;
