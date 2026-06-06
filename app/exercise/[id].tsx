import { Image, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Heart, Info, ListChecks, Repeat, Sparkles, X } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSession } from '@/lib/store';
import { getExerciseImageSource } from '@/lib/exerciseImages';
import { cn } from '@/lib/utils';

const DIFFICULTY_CLS: Record<string, string> = {
  Gentle: 'bg-primary/10 text-primary',
  Steady: 'bg-accent/15 text-accent',
  Spicy: 'bg-destructive/10 text-destructive',
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scenario = useSession((s) => s.scenario);
  const exercise = scenario?.exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text variant="muted">Move not found.</Text>
        <Button variant="ghost" className="mt-3" onPress={() => router.back()}>
          <Text weight="semibold" className="text-foreground">
            Close
          </Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="overflow-hidden">
        <LinearGradient
          colors={['hsl(162, 34%, 24%)', 'hsl(162, 30%, 17%)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 12, paddingBottom: 22, paddingHorizontal: 20 }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
              <BookOpen size={13} color="white" />
              <Text size="xs" weight="semibold" className="text-white/90">
                Movement library
              </Text>
            </View>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full bg-white/10"
              onPress={() => router.back()}
            >
              <X size={18} color="white" />
            </Button>
          </View>
          <Text size="2xl" weight="bold" className="text-white">
            {exercise.name}
          </Text>
          <Text size="sm" className="mt-1 text-white/75">
            {exercise.focus}
          </Text>
          <View className="mt-3 flex-row gap-2">
            <View className="rounded-full bg-white/15 px-3 py-1">
              <Text size="xs" weight="semibold" className="text-white">
                {exercise.duration}
              </Text>
            </View>
            <View className="rounded-full bg-white/15 px-3 py-1">
              <Text size="xs" weight="semibold" className="text-white">
                {exercise.reps}
              </Text>
            </View>
            <View className={cn('rounded-full px-3 py-1', DIFFICULTY_CLS[exercise.difficulty])}>
              <Text size="xs" weight="semibold" className={DIFFICULTY_CLS[exercise.difficulty].split(' ')[1]}>
                {exercise.difficulty}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference illustration */}
        <Animated.View entering={FadeInDown.duration(400)} className="mx-5 mt-5">
          <View className="items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary/40">
            <Image
              source={getExerciseImageSource(exercise.imageId)}
              style={{ width: '100%', aspectRatio: 4 / 3 }}
              resizeMode="contain"
              accessibilityLabel={`Illustration of ${exercise.name}`}
            />
          </View>
          <Text size="xs" variant="muted" className="mt-1.5 text-center">
            Reference form — how the move should look
          </Text>
        </Animated.View>

        {/* Why this — the Mirror */}
        <Animated.View entering={FadeInDown.duration(400)} className="mx-5 mt-5">
          <View className="flex-row gap-3 rounded-2xl bg-secondary/60 p-4">
            <Sparkles size={17} className="text-accent" />
            <View className="flex-1">
              <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
                Why this fits your moment
              </Text>
              <Text size="sm" className="mt-1.5 leading-relaxed text-foreground">
                {exercise.rationale}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* How to */}
        <View className="mx-5 mt-6">
          <View className="mb-3 flex-row items-center gap-2">
            <ListChecks size={17} className="text-primary" />
            <Text size="sm" weight="semibold">
              How to do it
            </Text>
          </View>
          {exercise.steps.map((step, i) => (
            <View key={step.title} className="mb-2.5 flex-row gap-3 rounded-2xl border border-border bg-card p-4">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Text size="sm" weight="bold" className="text-primary-foreground">
                  {i + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text size="sm" weight="semibold" className="text-card-foreground">
                  {step.title}
                </Text>
                <Text size="xs" variant="muted" className="mt-0.5 leading-relaxed">
                  {step.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Form tips */}
        <View className="mx-5 mt-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Info size={17} className="text-primary" />
            <Text size="sm" weight="semibold">
              Form that keeps you safe
            </Text>
          </View>
          <View className="rounded-2xl border border-border bg-card p-4">
            {exercise.formTips.map((tip) => (
              <View key={tip} className="mb-2 flex-row gap-2 last:mb-0">
                <Text size="sm" className="text-primary">
                  •
                </Text>
                <Text size="sm" className="flex-1 leading-relaxed text-card-foreground">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confidence cue — the Companion */}
        <View className="mx-5 mt-5">
          <View className="flex-row gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-4">
            <Heart size={17} className="text-accent" />
            <View className="flex-1">
              <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
                Confidence cue
              </Text>
              <Text size="sm" className="mt-1.5 leading-relaxed text-foreground">
                {exercise.confidenceCue}
              </Text>
            </View>
          </View>
        </View>

        {/* Alternatives */}
        <View className="mx-5 mt-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Repeat size={17} className="text-primary" />
            <Text size="sm" weight="semibold">
              Prefer something else?
            </Text>
          </View>
          {exercise.alternatives.map((alt) => (
            <View key={alt.name} className="mb-2 rounded-2xl border border-border bg-card p-4">
              <Text size="sm" weight="semibold" className="text-card-foreground">
                {alt.name}
              </Text>
              <Text size="xs" variant="muted" className="mt-0.5 leading-relaxed">
                {alt.why}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button size="lg" className="h-16 rounded-2xl" onPress={() => router.back()}>
          <Text weight="semibold" className="text-primary-foreground">
            Got it — back to my moves
          </Text>
        </Button>
      </View>
    </View>
  );
}
