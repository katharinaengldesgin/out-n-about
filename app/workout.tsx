import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronRight, Heart, Info, Pause, Play, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSession } from '@/lib/store';
import { ExerciseImage } from '@/components/ExerciseImage';

const ENCOURAGEMENTS = [
  'You showed up. That\u2019s the whole battle.',
  'No one\u2019s watching the way you think \u2014 you\u2019ve got this.',
  'Steady beats perfect. Keep your rhythm.',
  'This is exactly what spontaneous looks like.',
];

export default function Workout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scenario, activeIndex, nextExercise, markExerciseDone, completedExercises, finishWorkout } =
    useSession();

  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cheer, setCheer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return undefined;
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  // rotate encouragements
  useEffect(() => {
    const t = setInterval(() => setCheer((c) => (c + 1) % ENCOURAGEMENTS.length), 9000);
    return () => clearInterval(t);
  }, []);

  const progress = useSharedValue(0);

  const total = scenario?.exercises.length ?? 0;

  useEffect(() => {
    if (total > 0) {
      progress.value = withTiming(activeIndex / total, { duration: 400 });
    }
  }, [activeIndex, total, progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.max(progress.value * 100, 4)}%` }));

  if (!scenario) {
    router.replace('/');
    return null;
  }

  const current = scenario.exercises[activeIndex];
  const isLast = activeIndex === total - 1;
  const doneCount = completedExercises.length;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  function handleAdvance() {
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markExerciseDone(current.id);
    if (isLast) {
      finishWorkout();
      router.replace('/reflection');
    } else {
      nextExercise();
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Top bar with timer + progress */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-3">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.replace('/recommendations')}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
            accessibilityLabel="End workout"
          >
            <X size={18} className="text-secondary-foreground" />
          </Pressable>
          <View className="items-center">
            <Text size="xs" variant="muted" weight="medium">
              Move {activeIndex + 1} of {total}
            </Text>
            <Text size="lg" weight="bold" className="tabular-nums">
              {mm}:{ss}
            </Text>
          </View>
          <Pressable
            onPress={() => setPaused((p) => !p)}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
          >
            {paused ? (
              <Play size={18} className="text-secondary-foreground" />
            ) : (
              <Pause size={18} className="text-secondary-foreground" />
            )}
          </Pressable>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-muted">
          <Animated.View style={barStyle} className="h-full rounded-full bg-primary" />
        </View>
      </View>

      <View className="flex-1 px-5">
        {/* Current move card */}
        <Animated.View
          key={current.id}
          entering={FadeInRight.duration(350)}
          className="mt-2 overflow-hidden rounded-[28px]"
        >
          <LinearGradient
            colors={['hsl(162, 34%, 24%)', 'hsl(162, 30%, 16%)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
            <Text size="xs" weight="semibold" className="uppercase tracking-widest text-white/60">
              Now
            </Text>
            <Text size="2xl" weight="bold" className="mt-1 text-white">
              {current.name}
            </Text>
            <Text size="sm" className="mt-1 text-white/70">
              {current.focus}
            </Text>

            <View className="mt-4 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
              <ExerciseImage
                imageId={current.imageId}
                style={{ width: '100%', aspectRatio: 16 / 10 }}
                glyphColor="#ffffff"
                glyphSize={120}
                glyphFrameClassName="w-full items-center justify-center py-7"
                accessibilityLabel={`Illustration of ${current.name}`}
              />
            </View>

            <View className="mt-4 flex-row gap-2">
              <View className="rounded-full bg-white/15 px-3 py-1.5">
                <Text size="xs" weight="semibold" className="text-white">
                  {current.reps}
                </Text>
              </View>
              <View className="rounded-full bg-white/15 px-3 py-1.5">
                <Text size="xs" weight="semibold" className="text-white">
                  {current.duration}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-2 rounded-2xl bg-white/10 p-3">
              <Info size={14} color="white" />
              <Text size="xs" className="flex-1 leading-relaxed text-white/85">
                {current.confidenceCue}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick steps */}
        <View className="mt-4">
          {current.steps.map((step, i) => (
            <View key={step.title} className="mb-2 flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-secondary">
                <Text size="xs" weight="bold" className="text-primary">
                  {i + 1}
                </Text>
              </View>
              <Text size="sm" className="flex-1 leading-relaxed text-foreground">
                <Text size="sm" weight="semibold">
                  {step.title}.{' '}
                </Text>
                {step.detail}
              </Text>
            </View>
          ))}
        </View>

        {/* Rotating encouragement — the Companion */}
        <Animated.View key={cheer} entering={FadeIn.duration(500)} className="mt-auto mb-3">
          <View className="flex-row items-center gap-2.5 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
            <Heart size={16} className="text-accent" />
            <Text size="sm" weight="medium" className="flex-1 text-foreground">
              {ENCOURAGEMENTS[cheer]}
            </Text>
          </View>
        </Animated.View>

        {/* Upcoming */}
        {!isLast ? (
          <Pressable
            onPress={() => router.push(`/exercise/${scenario.exercises[activeIndex + 1].id}`)}
            className="mb-3 flex-row items-center justify-between rounded-xl bg-muted/60 px-4 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Text size="xs" variant="muted" weight="semibold">
                NEXT
              </Text>
              <Text size="sm" weight="medium" className="text-foreground">
                {scenario.exercises[activeIndex + 1].name}
              </Text>
            </View>
            <ChevronRight size={16} className="text-muted-foreground" />
          </Pressable>
        ) : null}
      </View>

      <View
        className="border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button size="lg" className="h-16 rounded-2xl" onPress={handleAdvance}>
          <View className="flex-row items-center gap-2">
            <Check size={18} color="white" />
            <Text weight="semibold" className="text-primary-foreground">
              {isLast ? `Finish \u00b7 ${doneCount + 1} of ${total} done` : 'Done \u2014 next move'}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );
}
