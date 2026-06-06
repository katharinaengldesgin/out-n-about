import * as React from 'react';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import type { GlyphId } from '@/lib/exerciseImages';

// ---------------------------------------------------------------------------
// OUT n ABOUT — reduced line-art glyphs.
// Simple, minimal single-stroke illustrations used as a fallback for
// AI-generated exercises that have no authored photo (e.g. "Tree-Stretch" ->
// a plain tree). Drawn with `currentColor`-style theming via the `color` prop
// so they sit on both light surfaces (eucalyptus green) and the dark workout
// gradient (white).
// ---------------------------------------------------------------------------

export type ExerciseGlyphProps = {
  glyph: GlyphId;
  /** Stroke color. Defaults to the eucalyptus primary. */
  color?: string;
  /** Rendered size of the (square) viewBox. */
  size?: number;
  strokeWidth?: number;
};

// Default to the primary eucalyptus green (hsl(162 32% 26%)).
const DEFAULT_COLOR = '#2d5c4d';

function GlyphPaths({ glyph, color, sw }: { glyph: GlyphId; color: string; sw: number }) {
  const stroke = color;
  const common = {
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  switch (glyph) {
    // A plain, calm tree — trunk + soft rounded canopy. Used for stretch /
    // reach / mobility moves like "Tree-Stretch".
    case 'tree':
      return (
        <>
          <Path d="M50 78 L50 50" {...common} />
          <Path
            d="M50 18 C34 18 26 30 26 42 C26 53 35 58 50 58 C65 58 74 53 74 42 C74 30 66 18 50 18 Z"
            {...common}
          />
          <Line x1="38" y1="78" x2="62" y2="78" {...common} />
        </>
      );

    // Standing reach / stretch — figure with both arms overhead.
    case 'stretch':
      return (
        <>
          <Circle cx="50" cy="20" r="7" {...common} />
          <Path d="M50 27 L50 60" {...common} />
          <Path d="M50 33 L36 14 M50 33 L64 14" {...common} />
          <Path d="M50 60 L40 84 M50 60 L60 84" {...common} />
        </>
      );

    // Bodyweight squat — figure with bent knees, arms forward.
    case 'squat':
      return (
        <>
          <Circle cx="46" cy="20" r="7" {...common} />
          <Path d="M46 27 L48 48" {...common} />
          <Path d="M48 40 L72 38" {...common} />
          <Path d="M48 48 L32 58 L40 78 M48 48 L62 60 L56 80" {...common} />
        </>
      );

    // Forward lunge — split stance.
    case 'lunge':
      return (
        <>
          <Circle cx="42" cy="20" r="7" {...common} />
          <Path d="M42 27 L44 50" {...common} />
          <Path d="M44 36 L60 44" {...common} />
          <Path d="M44 50 L66 60 L74 78 M44 50 L34 70 L34 82" {...common} />
        </>
      );

    // Marching in place — one knee lifted.
    case 'march':
      return (
        <>
          <Circle cx="48" cy="18" r="7" {...common} />
          <Path d="M48 25 L48 52" {...common} />
          <Path d="M48 34 L34 42 M48 34 L62 28" {...common} />
          <Path d="M48 52 L40 82 M48 52 L62 62 L58 76" {...common} />
        </>
      );

    // Glute bridge — lying with hips raised.
    case 'bridge':
      return (
        <>
          <Path d="M16 72 L40 72 L56 52 L70 52" {...common} />
          <Path d="M70 52 L70 74" {...common} />
          <Circle cx="22" cy="66" r="6" {...common} />
          <Line x1="14" y1="80" x2="78" y2="80" {...common} />
        </>
      );

    // Single-leg balance — figure on one leg.
    case 'balance':
      return (
        <>
          <Circle cx="50" cy="18" r="7" {...common} />
          <Path d="M50 25 L50 56" {...common} />
          <Path d="M50 34 L36 30 M50 34 L64 30" {...common} />
          <Path d="M50 56 L50 84 M50 64 L66 56" {...common} />
          <Line x1="40" y1="84" x2="60" y2="84" {...common} />
        </>
      );

    // Brisk walk loop — figure mid-stride.
    case 'walk':
    default:
      return (
        <>
          <Circle cx="46" cy="18" r="7" {...common} />
          <Path d="M46 25 L48 54" {...common} />
          <Path d="M48 36 L34 44 M48 36 L62 32" {...common} />
          <Polyline points="48,54 38,72 34,84" {...common} />
          <Polyline points="48,54 62,68 66,84" {...common} />
        </>
      );
  }
}

export function ExerciseGlyph({
  glyph,
  color = DEFAULT_COLOR,
  size = 96,
  strokeWidth = 3,
}: ExerciseGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <GlyphPaths glyph={glyph} color={color} sw={strokeWidth} />
    </Svg>
  );
}
