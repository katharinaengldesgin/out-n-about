import type { ImageSourcePropType } from 'react-native';

// ---------------------------------------------------------------------------
// OUT n ABOUT — exercise reference images.
// User-authored illustrations live in /assets and are wired statically here so
// every exercise always renders the same picture (consistent, offline, fast).
// Prewritten exercises map by id; AI-generated exercises fall back to keyword
// matching on the move name + what it uses so they still get a reference.
// ---------------------------------------------------------------------------

export type ExerciseImageId =
  | 'bench-pushups'
  | 'bench-step-ups'
  | 'bench-tricep-dips'
  | 'incline-stair-pushups'
  | 'plank'
  | 'pull-ups'
  | 'avatar';

const IMAGE_SOURCES: Record<ExerciseImageId, ImageSourcePropType> = {
  'bench-pushups': require('@/assets/Bench-Pushups.png'),
  'bench-step-ups': require('@/assets/Bench-Step-ups.png'),
  'bench-tricep-dips': require('@/assets/Bench-Tricep-Dips.png'),
  'incline-stair-pushups': require('@/assets/Incline-Stair-pushups.png'),
  plank: require('@/assets/Plank.png'),
  'pull-ups': require('@/assets/Pull-ups--on-bar-.png'),
  avatar: require('@/assets/Fitness-Avatar.png'),
};

export function getExerciseImageSource(id?: ExerciseImageId): ImageSourcePropType {
  if (id && IMAGE_SOURCES[id]) return IMAGE_SOURCES[id];
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
const KEYWORD_RULES: { test: RegExp; image: ExerciseImageId }[] = [
  { test: /pull[\s-]?up|chin[\s-]?up|bar|hang/i, image: 'pull-ups' },
  { test: /dip|tricep/i, image: 'bench-tricep-dips' },
  { test: /stair|incline/i, image: 'incline-stair-pushups' },
  { test: /step[\s-]?up/i, image: 'bench-step-ups' },
  { test: /push[\s-]?up|press|chest/i, image: 'bench-pushups' },
  { test: /plank|bridge|hold|core|glute|wall sit/i, image: 'plank' },
  { test: /march|squat|lunge|calf|walk|balance/i, image: 'avatar' },
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
