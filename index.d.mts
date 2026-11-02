/**
 * Types for the ported client renderer. Names in `client` are the app's own
 * minified ones; everything else in this file is a readable binding over them,
 * and the JSDoc on each binding says which bundle symbol it is.
 */

/** The 26 picker names, in the client's order. Four of them are aliases. */
export type AvatarShape =
  | 'blob' | 'pebble' | 'bean' | 'egg' | 'squircle' | 'tablet' | 'capsule' | 'cylinder'
  | 'hex' | 'gem' | 'crystal' | 'wedge' | 'shield' | 'dome' | 'arch' | 'cloud' | 'teardrop'
  | 'leaf' | 'square' | 'sparkle' | 'clover' | 'flower' | 'heart' | 'house' | 'star'
  | 'pumpkin';

/** What the renderer takes after `bodyFor` resolves the aliases (i_). */
export type AvatarBody =
  | 'sphere' | 'cloud' | 'square' | 'sparkle' | 'clover' | 'heartChubby' | 'starFlower'
  | 'teardrop' | 'tablet' | 'wedge' | 'house' | 'star6' | 'pebble' | 'bean' | 'egg'
  | 'squircle' | 'capsule' | 'cylinder' | 'hex' | 'gem' | 'crystal' | 'shield' | 'dome'
  | 'arch' | 'leaf' | 'pumpkin';

export type AvatarColorId =
  | 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green'
  | 'cyan' | 'blue' | 'violet' | 'magenta' | 'gray';

export interface AvatarColor {
  id: AvatarColorId;
  label: string;
  value: string;
}

/** Fields the client's own resolver reads (jn). Picture URLs are not here: the app handles those outside the renderer. */
export interface AvatarInput {
  agentId: string;
  avatarShape?: string | null;
  avatarColor?: string | null;
}

export interface ResolvedAvatar {
  shape: AvatarShape;
  color: AvatarColorId;
}

/** The emitter's paint record (o_). Eyes are cut out while `cutout` is true. */
export interface Paint {
  ink: [number, number, number];
  spot: [number, number, number];
  cutout: boolean;
  inkPaint: unknown;
  spotPaint?: unknown;
}

/** The client's frame: what `eo(...).frame()` returns and `Xg` consumes. */
export interface AvatarFrame {
  body: AvatarBody;
  quat: [number, number, number, number];
  zoom: number;
  offset: [number, number];
  squash: [number, number];
  squashAnchor: number;
  eyes: unknown[] | null;
  glow: unknown | null;
  inspectWeight: number;
  bodies: Array<{ body: string; weight: number }>;
  morph: unknown;
}

/** Options are the client component's own prop names (f_), plus `shape`/`color` sugar. */
export interface AvatarOptions extends Partial<AvatarInput> {
  /** Picker name; takes precedence over a derived one. */
  shape?: AvatarShape | string;
  /** Colour id or a plain hex string. */
  color?: AvatarColorId | string;
  /** One per element on the page: it namespaces the emitted defs. */
  id?: string;
  /** A state from STATES; omit to draw the body with no clip machine. */
  state?: string;
  /** CSS pixels. Omit on createAvatar to let the element's box drive it. */
  size?: number;
  seed?: number | string;
  /**
   * Seconds to step the driver, as the play loop would. Leave it undefined for
   * the client's still frame, which is what a resting avatar shows.
   */
  time?: number | null;
  /** Sprite coverage of the box; the client default is .6. */
  fill?: number;
  /** Overrides the fill-derived sprite size. */
  resolution?: number;
  maxFrameRate?: number;
  isPlaying?: boolean;
  isStatic?: boolean;
  isEmphasized?: boolean;
  isFollowingPointer?: boolean;
  /** The client's shaded-mesh debug view. */
  isProof?: boolean;
  /** A clip record, for callers that drive the driver directly. */
  clip?: unknown;
  morph?: unknown;
  /** Bypasses shape and colour resolution. */
  appearance?: Paint;
  body?: AvatarBody | string;
}

export interface AvatarController {
  attach(target: { host: Element; canvas: Element }): () => void;
  update(next: Partial<AvatarOptions>): void;
  setState(state: string): void;
  setBody(body: string): void;
  setPlaying(playing: boolean): void;
  setExpression(name: string, options?: unknown): void;
  blink(): void;
  look(angle: number): void;
  restart(): void;
  poke(name: string, options?: unknown): void;
  gaze(point: { x: number; y: number } | null): void;
  /** Detaches observers and stops the loop. */
  destroy(): void;
}

/** Picker names in the client's order (ln). */
export const SHAPES: readonly AvatarShape[];
/** Render bodies (ei). */
export const BODIES: readonly AvatarBody[];
/** The colour table (nn). */
export const COLORS: readonly AvatarColor[];
/** Every key in the client's state table (lo). */
export const STATES: readonly string[];
/** Below this size the client switches to the compact clips (s_). */
export const COMPACT_SIZE: number;

/** Picker name to render body (i_): blob to sphere, flower to starFlower, heart to heartChubby, star to star6. */
export function bodyFor(shape: string): AvatarBody;
/** Hex for a colour id, or null when the value is already a hex. */
export function colorValue(id: string): string | null;
/** The colour a shape forces, or null. In 0.78.1 only the pumpkin pins one. */
export function pinnedColor(shape: string): AvatarColorId | null;
/** Paint record from the client's factory (o_): one argument cuts the eyes out. */
export function paintOf(ink: unknown, spot?: unknown): Paint;
/** agent id to shape and colour, through the client's gated resolver (jn). */
export function resolveAvatar(input: string | AvatarInput): ResolvedAvatar;

/** Draw one avatar with the client renderer. */
export function renderAvatarSvg(options?: AvatarOptions): string;

/** Mount a live avatar: the client's own component, with its frame cap and visibility gating. */
export function createAvatar(element: Element, options?: AvatarOptions): AvatarController;

/**
 * The transplanted renderer, undressed. The declarations keep their bundle names
 * and offsets; data/extracted/avatar-engine.json maps each to its source bytes.
 */
export interface ClientRenderer {
  /** Build the stateful driver: frame(), advance(), seek(), play(), setGaze(), poke(). */
  eo(input: { body: string }): {
    frame(): AvatarFrame;
    advance(seconds: number): void;
    seek(seconds: number): void;
    play(): void;
    pause(): void;
    rest(): void;
    setBody(body: string, options?: { isInstant?: boolean }): void;
    setGaze(point: unknown): void;
    setGazeAlways(on: boolean): void;
    setExpression(name: string, options?: unknown): void;
    setMorph(morph: unknown, options?: { isInstant?: boolean }): void;
    setInspect(inspection: unknown): void;
    blink(): void;
    poke(name: string, options?: unknown): void;
    look(angle: number): void;
    holdFace(face: string | null): void;
    load(clip: unknown, options?: { isPlaying?: boolean; phase?: number }): void;
    readonly isPlaying: boolean;
    readonly isSettled: boolean;
    readonly duration: number;
    readonly time: number;
    readonly loopCount: number;
    readonly face: string;
  };
  /** Clip machine over the state table: setState(), advance(), setCompact(), setResting(). */
  go(
    driver: ReturnType<ClientRenderer['eo']>,
    state: string,
    options: { seed: () => number; isCompact: boolean; isResting: boolean },
  ): {
    readonly state: string;
    readonly clip: unknown;
    setState(state: string): void;
    setCompact(compact: boolean): void;
    setEmphasis(emphasis: boolean): void;
    setResting(resting: boolean): void;
    advance(seconds: number): void;
  };
  /** Frame and paint to an SVG tree (Xg). */
  Xg(frame: AvatarFrame, paint: Paint, size: number, id: string, options?: Record<string, unknown>): unknown;
  /** SVG tree to a string (hp). */
  hp(tree: unknown): string;
  /** The component factory behind createAvatar (p_). */
  p_(options: Record<string, unknown>): AvatarController;
  /** Prop normaliser; its defaults are this package's defaults (f_). */
  f_(options: Record<string, unknown>): Record<string, unknown>;
  /** Random source the clip machine shuffles its clips with (ba). */
  ba(seed: number): () => number;
  /** True when the OS asks for reduced motion (d_). */
  d_(): boolean;
  /** Picker name to render body (i_). */
  i_(shape: string): AvatarBody;
  /** Paint record (o_). */
  o_(ink: unknown, spot?: unknown): Paint;
  /** id to shape and colour (An), and the gated variant (jn). */
  An(input: AvatarInput): ResolvedAvatar;
  jn(input: AvatarInput): ResolvedAvatar;
  /** Sprite size from fill (no). */
  no(fill: number): number;
  /** Pointer position in a box to a gaze target (fa). */
  fa(rect: DOMRect, point: { x: number; y: number }): unknown;
  /** Tables: picker shapes, bodies, colours, gated shapes, state table, compact threshold. */
  ln: AvatarShape[];
  ei: AvatarBody[];
  nn: AvatarColor[];
  cn: Array<{ shape: string, pickerGate: string, pickerColor: string }>;
  lo: Record<string, unknown>;
  s_: number;
  [symbol: string]: unknown;
}

export const client: ClientRenderer;
