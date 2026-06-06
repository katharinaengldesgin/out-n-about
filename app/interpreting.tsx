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

import { Button } from '@/components/ui/button';
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
  const generating = useSession((s) => s.generating);
  const scenario = useSession((s) => s.scenario);
  const rawDescription = useSession((s) => s.rawDescription);
  const [step, setStep] = useState(0);
  const [stalled, setStalled] = useState(false);

  // Walk the visible analysis steps. They loop on the last one until the real
  // AI result lands, so the loading state always feels honest and in-progress.
  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s < ANALYSIS_STEPS.length ? s + 1 : s));
    }, 600);
    return () => clearInterval(id);
  }, []);

  // When generation finishes and we have a scenario, move on. Hold briefly so
  // the final checkmark is visible rather than flashing past.
  useEffect(() => {
    if (!generating && scenario) {
      const t = setTimeout(() => router.replace('/recommendations'), 450);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [generating, scenario, router]);

  // Honest timeout: if something is wrong (e.g. nothing was ever generated),
  // give the user a calm way out instead of an endless spinner.
  useEffect(() => {
    const t = setTimeout(() => {
      if (generating || !scenario) setStalled(true);
    }, 18000);
    return () => clearTimeout(t);
  }, [generating, scenario]);

  const lastStepActive = step >= ANALYSIS_STEPS.length;

  return (
    <View className="flex-1 items-center justify-center bg-background px-7">
      <Animated.View entering={FadeIn.duration(400)} className="mb-8 items-center">
        <Wordmark size="lg" />
        <Text size="sm" variant="muted" className="mt-3 text-center leading-relaxed">
          Reading your moment — not just you, but everything around you.
        </Text>
      </Animated.View>

      {/* What the user said, reflected back immediately */}
      {rawDescription ? (
        <Animated.View
          entering={FadeInDown.delay(150).duration(450)}
          className="mb-8 w-full rounded-2xl border border-border bg-card p-4"
        >
          <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
            Reflecting back
          </Text>
          <Text size="base" className="mt-2 italic leading-relaxed text-card-foreground">
            “{rawDescription}”
          </Text>
        </Animated.View>
      ) : null}

      <View className="w-full">
        {ANALYSIS_STEPS.map((label, i) => {
          const isLast = i === ANALYSIS_STEPS.length - 1;
          // Last step stays "active" (working) until the AI result arrives.
          const done = isLast ? !generating && !!scenario : step > i + 1;
          const active = isLast ? generating || !scenario : step === i + 1;
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
                className={cn(done || active ? 'text-foreground' : 'text-muted-foreground')}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {stalled ? (
        <Animated.View entering={FadeIn} className="mt-8 w-full items-center">
          <Text size="sm" variant="muted" className="mb-3 text-center leading-relaxed">
            This is taking longer than usual. Want to try describing your moment again?
          </Text>
          <Button variant="outline" onPress={() => router.replace('/context')}>
            <Text weight="semibold" className="text-foreground">
              Describe it again
            </Text>
          </Button>
        </Animated.View>
      ) : (
        <Text size="xs" variant="muted" className="mt-8 text-center">
          {lastStepActive ? 'Almost there — choosing the right moves for you…' : ' '}
        </Text>
      )}
    </View>
  );
}
