import * as React from 'react';
import { Image, View, type ImageStyle, type StyleProp } from 'react-native';

import { ExerciseGlyph } from '@/components/ExerciseGlyph';
import {
  getExerciseImageSource,
  isGlyphId,
  type ExerciseImageId,
} from '@/lib/exerciseImages';

// ---------------------------------------------------------------------------
// One render path for every exercise reference visual.
// - Authored photo ids -> the existing <Image> (unchanged look).
// - Line-art glyph ids -> a reduced SVG glyph, centered in the frame.
// Keeps the three call sites (exercise detail, workout, recommendations)
// identical so photo exercises render exactly as before.
// ---------------------------------------------------------------------------

export type ExerciseImageProps = {
  imageId?: ExerciseImageId;
  /** Forwarded to <Image> for photo ids (width / aspectRatio etc.). */
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  /** Glyph stroke color + rendered size, used only for glyph ids. */
  glyphColor?: string;
  glyphSize?: number;
  /** Tailwind classes for the glyph frame (controls its height/centering). */
  glyphFrameClassName?: string;
};

export function ExerciseImage({
  imageId,
  style,
  accessibilityLabel,
  glyphColor,
  glyphSize = 88,
  glyphFrameClassName = 'h-full w-full items-center justify-center',
}: ExerciseImageProps) {
  if (isGlyphId(imageId)) {
    return (
      <View
        className={glyphFrameClassName}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        <ExerciseGlyph glyph={imageId} color={glyphColor} size={glyphSize} />
      </View>
    );
  }

  return (
    <Image
      source={getExerciseImageSource(imageId)}
      style={style}
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
