import type { ImageSourcePropType } from 'react-native';

// ---------------------------------------------------------------------------
// OUT n ABOUT — exercise reference images.
// User-authored illustrations live in /assets and are wired statically here so
// every exercise always renders the same picture (consistent, offline, fast).
// Prewritten exercises map by id; AI-generated exercises fall back to keyword
// matching on the move name + what it uses so they still get a reference.
// ---------------------------------------------------------------------------

// Authored photo illustrations (PNGs in /assets).
export type PhotoImageId =
  | 'bench-pushups'
  | 'bench-step-ups'
  | 'bench-tricep-dips'
  | 'incline-stair-pushups'
  | 'plank'
  | 'pull-ups'
  | 'avatar';

// Reduced line-art glyphs (rendered via react-native-svg), used as a fallback
// for AI-generated exercises that have no authored photo.
export type GlyphId =
  | 'tree'
  | 'stretch'
  | 'squat'
  | 'lunge'
  | 'march'
  | 'bridge'
  | 'balance'
  | 'walk';

export type ExerciseImageId = PhotoImageId | GlyphId;

const GLYPH_IDS: readonly GlyphId[] = [
  'tree',
  'stretch',
  'squat',
  'lunge',
  'march',
  'bridge',
  'balance',
  'walk',
];

/** True when the id should be rendered as an SVG line-art glyph (not a PNG). */
export function isGlyphId(id?: ExerciseImageId): id is GlyphId {
  return !!id && (GLYPH_IDS as readonly string[]).includes(id);
}

const IMAGE_SOURCES: Record<PhotoImageId, ImageSourcePropType> = {
  'bench-pushups': require('@/assets/Bench-Pushups.png'),
  'bench-step-ups': require('@/assets/Bench-Step-ups.png'),
  'bench-tricep-dips': require('@/assets/Bench-Tricep-Dips.png'),
  'incline-stair-pushups': require('@/assets/Incline-Stair-pushups.png'),
  plank: require('@/assets/Plank.png'),
  'pull-ups': require('@/assets/Pull-ups--on-bar-.png'),
  avatar: require('@/assets/Fitness-Avatar.png'),
};

export function getExerciseImageSource(id?: ExerciseImageId): ImageSourcePropType {
  if (id && !isGlyphId(id) && IMAGE_SOURCES[id]) return IMAGE_SOURCES[id];
  return IMAGE_SOURCES.avatar;
}

// Explicit mapping for the prewritten exercises (by exercise id).
const BY_EXERCISE_ID: Record<string, ExerciseImageId> = {
  // park-bench
  'incline-push': 'bench-pushups',
  'step-up': 'bench-step-ups',
  'grass-glute-bridge': 'plank',
  // street-stairs
  'calf-raise': 'bench-step-ups',
  'stair-incline-push': 'incline-stair-pushups',
  'march-in-place': 'avatar',
  // tight-space
  'wall-sit': 'plank',
  'standing-march': 'avatar',
  'wall-push': 'bench-pushups',
};

// Keyword rules for AI-generated exercises (checked in order).
// Authored-photo matches come first so they keep priority; reduced line-art
// glyphs follow as a fallback for moves with no photo (e.g. "Tree-Stretch").
const KEYWORD_RULES: { test: RegExp; image: ExerciseImageId }[] = [
  // Photo matches (highest priority).
  { test: /pull[\s-]?up|chin[\s-]?up|bar|hang/i, image: 'pull-ups' },
  { test: /dip|tricep/i, image: 'bench-tricep-dips' },
  { test: /stair|incline/i, image: 'incline-stair-pushups' },
  { test: /step[\s-]?up/i, image: 'bench-step-ups' },
  { test: /push[\s-]?up|press|chest/i, image: 'bench-pushups' },
  { test: /plank|hold|core|wall sit/i, image: 'plank' },
  // Line-art glyph fallbacks.
  { test: /tree|stretch|reach|mobility|open|fold|sky|overhead/i, image: 'stretch' },
  { test: /bridge|glute|hip raise|hip thrust/i, image: 'bridge' },
  { test: /squat|sit[\s-]?to[\s-]?stand|chair/i, image: 'squat' },
  { test: /lunge|split|step[\s-]?back|step[\s-]?forward/i, image: 'lunge' },
  { test: /march|knee[\s-]?lift|high[\s-]?knee/i, image: 'march' },
  { test: /balance|single[\s-]?leg|stand on one|stork|flamingo/i, image: 'balance' },
  { test: /walk|stride|loop|pace|step/i, image: 'walk' },
];

/**
 * Resolve a reference image for an exercise. Prefers an explicit id mapping,
 * then falls back to keyword matching against the move name + what it uses.
 */
export function resolveExerciseImageId(args: {
  id?: string;
  name?: string;
  uses?: string;
}): ExerciseImageId {
  if (args.id && BY_EXERCISE_ID[args.id]) return BY_EXERCISE_ID[args.id];
  const haystack = `${args.name ?? ''} ${args.uses ?? ''}`;
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(haystack)) return rule.image;
  }
  return 'avatar';
}
