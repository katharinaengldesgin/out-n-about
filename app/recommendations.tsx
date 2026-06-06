import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Footprints,
  HelpCircle,
  Info,
  Pencil,
  Shirt,
  Sparkles,
  Wind,
} from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSession, type InterpretedSignal } from '@/lib/store';
import { getExerciseImageSource } from '@/lib/exerciseImages';
import { cn } from '@/lib/utils';

const KIND_META: Record<InterpretedSignal['kind'], { icon: typeof Shirt; label: string }> = {
  environment: { icon: Footprints, label: 'Around you' },
  clothing: { icon: Shirt, label: 'Wearing' },
  conditions: { icon: Wind, label: 'Conditions' },
};

const CONFIDENCE_META: Record<InterpretedSignal['confidence'], { label: string; cls: string }> = {
  clear: { label: 'Clear', cls: 'bg-primary/10 text-primary' },
  likely: { label: 'Likely', cls: 'bg-accent/15 text-accent' },
  unsure: { label: 'Unsure', cls: 'bg-muted text-muted-foreground' },
};

const DIFFICULTY_CLS: Record<string, string> = {
  Gentle: 'bg-primary/10 text-primary',
  Steady: 'bg-accent/15 text-accent',
  Spicy: 'bg-destructive/10 text-destructive',
};

export default function Recommendations() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scenario, startWorkout, usedFallback } = useSession();
  const [removed, setRemoved] = useState<string[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(true);

  if (!scenario) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text variant="muted">No moment set yet.</Text>
        <Button className="mt-4" onPress={() => router.replace('/context')}>
          <Text weight="semibold" className="text-primary-foreground">
            Describe your surroundings
          </Text>
        </Button>
      </View>
    );
  }

  const exercises = scenario.exercises.filter((e) => !removed.includes(e.id));

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader eyebrow="Your moment, read" showBack onBack={() => router.replace('/context')} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reflection — the Mirror */}
        <Animated.View entering={FadeIn.duration(400)} className="px-5 pt-1">
          {usedFallback ? (
            <View className="mb-3 flex-row gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
              <Info size={14} className="mt-0.5 text-accent" />
              <Text size="xs" className="flex-1 leading-relaxed text-foreground/85">
                I couldn’t reach the live coach just now, so this is a close match from what you
                described. Still tailored to your moment — just not freshly generated.
              </Text>
            </View>
          ) : null}
          <View className="rounded-2xl bg-secondary/60 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Sparkles size={15} className="text-accent" />
              <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
                Here’s your moment
              </Text>
            </View>
            <Text size="base" className="leading-relaxed text-foreground">
              {scenario.reflection}
            </Text>
            <Pressable
              onPress={() => router.replace('/context')}
              className="mt-3 flex-row items-center gap-1.5 self-start"
            >
              <Pencil size={13} className="text-primary" />
              <Text size="xs" weight="semibold" className="text-primary">
                That’s not right — describe it again
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Signals — what the AI noticed (source transparency) */}
        <View className="mt-5 px-5">
          <Text size="sm" weight="semibold" className="mb-3">
            What I picked up on
          </Text>
          <View className="gap-2">
            {scenario.signals.map((sig, i) => {
              const meta = KIND_META[sig.kind];
              const Icon = meta.icon;
              const conf = CONFIDENCE_META[sig.confidence];
              return (
                <Animated.View
                  key={sig.label}
                  entering={FadeInDown.delay(80 * i).duration(400)}
                  className="flex-row gap-3 rounded-2xl border border-border bg-card p-3.5"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Icon size={17} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text size="sm" weight="semibold" className="text-card-foreground">
                        {sig.label}
                      </Text>
                      <View className={cn('rounded-full px-2 py-0.5', conf.cls)}>
                        <Text size="xs" weight="semibold" className={conf.cls.split(' ')[1]}>
                          {conf.label}
                        </Text>
                      </View>
                    </View>
                    <Text size="xs" variant="muted" className="mt-1 leading-relaxed">
                      {sig.note}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Honest follow-up — calm error handling */}
        {scenario.followUp && showFollowUp ? (
          <Animated.View entering={FadeInDown.duration(400)} className="mx-5 mt-4">
            <View className="flex-row gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <HelpCircle size={18} className="text-accent" />
              <View className="flex-1">
                <Text size="sm" weight="semibold" className="text-foreground">
                  One quick check
                </Text>
                <Text size="xs" className="mt-1 leading-relaxed text-foreground/80">
                  {scenario.followUp}
                </Text>
                <Pressable onPress={() => setShowFollowUp(false)} className="mt-2 self-start">
                  <Text size="xs" weight="semibold" className="text-accent">
                    Got it
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Suggestions */}
        <View className="mt-6 px-5">
          <View className="mb-1 flex-row items-center justify-between">
            <Text size="lg" weight="bold">
              Made for right now
            </Text>
            <Text size="xs" variant="muted">
              {exercises.length} moves
            </Text>
          </View>
          <Text size="xs" variant="muted" className="mb-3 leading-relaxed">
            Each one is here for a reason from what you described. Tap to see how, swap, or learn the form.
          </Text>

          {exercises.map((ex, i) => (
            <Animated.View key={ex.id} entering={FadeInDown.delay(60 * i).duration(400)} className="mb-3">
              <Pressable
                onPress={() => router.push(`/exercise/${ex.id}`)}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 flex-row gap-3 pr-2">
                    <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-secondary/50">
                      <Image
                        source={getExerciseImageSource(ex.imageId)}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                        accessibilityLabel={`Illustration of ${ex.name}`}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text size="base" weight="bold" className="flex-shrink text-card-foreground">
                          {ex.name}
                        </Text>
                        <View className={cn('rounded-full px-2 py-0.5', DIFFICULTY_CLS[ex.difficulty])}>
                          <Text size="xs" weight="semibold" className={DIFFICULTY_CLS[ex.difficulty].split(' ')[1]}>
                            {ex.difficulty}
                          </Text>
                        </View>
                      </View>
                      <Text size="xs" weight="medium" className="mt-0.5 text-muted-foreground">
                        {ex.focus}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </View>

                {/* Rationale — the Mirror, referencing their words */}
                <View className="mt-3 flex-row gap-2 rounded-xl bg-secondary/50 p-3">
                  <Info size={14} className="mt-0.5 text-primary" />
                  <Text size="xs" className="flex-1 leading-relaxed text-foreground/85">
                    {ex.rationale}
                  </Text>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text size="xs" variant="muted">
                    {ex.duration} · {ex.reps} · uses {ex.uses.toLowerCase()}
                  </Text>
                  {exercises.length > 1 ? (
                    <Pressable
                      hitSlop={8}
                      onPress={() => setRemoved((r) => [...r, ex.id])}
                      accessibilityLabel={`Remove ${ex.name}`}
                    >
                      <Text size="xs" weight="semibold" className="text-muted-foreground">
                        Swap out
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          ))}

          {removed.length > 0 ? (
            <Pressable onPress={() => setRemoved([])} className="mt-1 self-center">
              <Text size="xs" weight="semibold" className="text-primary">
                Restore removed moves
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Trust / limits disclaimer — placed where it's relevant */}
        <View className="mx-5 mt-5 rounded-2xl border border-border bg-muted/60 p-4">
          <Text size="xs" weight="semibold" className="mb-1 text-foreground">
            A note on trust
          </Text>
          <Text size="xs" variant="muted" className="leading-relaxed">
            These suggestions are built from common movement coaching and only the words you shared — I
            can’t see you, so I can’t judge balance, injuries, or pain. Move at your own pace, stop if
            something hurts, and check with a professional for medical concerns. This isn’t medical advice.
          </Text>
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="h-16 rounded-2xl"
          disabled={exercises.length === 0}
          onPress={() => {
            startWorkout();
            router.push('/workout');
          }}
        >
          <Text weight="semibold" className="text-primary-foreground">
            Preview & start — {exercises.length} moves
          </Text>
        </Button>
      </View>
    </View>
  );
}
