import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Check, Loader } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Wordmark } from '@/components/Wordmark';
import { ANALYSIS_STEPS, useSession } from '@/lib/store';
import { cn } from '@/lib/utils';

function Spinner() {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 360}deg` }] }));
  return (
    <Animated.View style={style}>
      <Loader size={18} className="text-primary" />
    </Animated.View>
  );
}

export default function Interpreting() {
  const router = useRouter();
  const scenario = useSession((s) => s.scenario);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    ANALYSIS_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 650 * (i + 1)));
    });
    timers.push(
      setTimeout(() => router.replace('/recommendations'), 650 * ANALYSIS_STEPS.length + 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-7">
      <Animated.View entering={FadeIn.duration(400)} className="mb-8 items-center">
        <Wordmark size="lg" />
        <Text size="sm" variant="muted" className="mt-3 text-center leading-relaxed">
          Reading your moment — not just you, but everything around you.
        </Text>
      </Animated.View>

      {/* Reflection preview */}
      {scenario ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(450)}
          className="mb-8 w-full rounded-2xl border border-border bg-card p-4"
        >
          <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
            Reflecting back
          </Text>
          <Text size="base" className="mt-2 leading-relaxed text-card-foreground">
            {scenario.reflection}
          </Text>
        </Animated.View>
      ) : null}

      <View className="w-full">
        {ANALYSIS_STEPS.map((label, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <View key={label} className="mb-3 flex-row items-center gap-3">
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  done ? 'bg-primary' : active ? 'bg-secondary' : 'bg-muted',
                )}
              >
                {done ? <Check size={15} color="white" /> : active ? <Spinner /> : null}
              </View>
              <Text
                size="sm"
                weight={done || active ? 'medium' : 'regular'}
                className={cn(done ? 'text-foreground' : active ? 'text-foreground' : 'text-muted-foreground')}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
