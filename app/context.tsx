import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Keyboard, Lock, Mic, Pencil } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SAMPLE_SCENARIOS, VOICE_PROMPTS, useSession } from '@/lib/store';
import { cn } from '@/lib/utils';

function MicOrb({ listening }: { listening: boolean }) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (listening) {
      scale.value = withRepeat(withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
      ring.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
    } else {
      cancelAnimation(scale);
      cancelAnimation(ring);
      scale.value = withTiming(1, { duration: 250 });
      ring.value = 0;
    }
    return () => {
      cancelAnimation(scale);
      cancelAnimation(ring);
    };
  }, [listening, scale, ring]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 - ring.value * 0.5,
    transform: [{ scale: 1 + ring.value * 0.9 }],
  }));

  return (
    <View className="h-44 items-center justify-center">
      <Animated.View
        style={ringStyle}
        className="absolute h-36 w-36 rounded-full border-2 border-primary"
      />
      <Animated.View style={orbStyle}>
        <View
          className={cn(
            'h-28 w-28 items-center justify-center rounded-full',
            listening ? 'bg-primary' : 'bg-secondary',
          )}
        >
          <Mic size={36} color={listening ? 'white' : 'hsl(162, 32%, 26%)'} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function ContextFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { inputMode, setInputMode, interpret } = useSession();

  const [listening, setListening] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [typed, setTyped] = useState('');

  const isVoice = inputMode === 'voice';

  function simulateVoice(scenarioId: string, transcript: string) {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListening(true);
    setCaptured(null);
    setPickedId(scenarioId);
    // simulate ephemeral, on-the-fly transcription
    setTimeout(() => {
      setListening(false);
      setCaptured(transcript);
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2200);
  }

  function proceed() {
    if (isVoice && pickedId) {
      interpret({ scenarioId: pickedId, text: captured ?? undefined });
    } else {
      interpret({ text: typed.trim() });
    }
    router.push('/interpreting');
  }

  const canProceed = isVoice ? !!captured : typed.trim().length > 8;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader eyebrow="Set your moment" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-1">
          <Text size="2xl" weight="bold" className="leading-tight">
            Talk me through where you are.
          </Text>
          <Text size="sm" variant="muted" className="mt-2 leading-relaxed">
            No right answer here. A sentence or two is plenty — I’ll figure out the rest. It’s the
            surroundings and what you’re wearing that help most.
          </Text>
        </View>

        {/* Mode toggle */}
        <View className="mx-5 mt-5 flex-row rounded-2xl bg-secondary p-1">
          {(['voice', 'text'] as const).map((m) => {
            const active = inputMode === m;
            const Icon = m === 'voice' ? Mic : Keyboard;
            return (
              <Pressable
                key={m}
                onPress={() => setInputMode(m)}
                className={cn(
                  'h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl',
                  active && 'bg-card shadow-sm',
                )}
              >
                <Icon size={16} className={active ? 'text-primary' : 'text-muted-foreground'} />
                <Text size="sm" weight="semibold" className={active ? 'text-foreground' : 'text-muted-foreground'}>
                  {m === 'voice' ? 'Speak' : 'Type instead'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Privacy note */}
        <Animated.View entering={FadeIn} className="mx-5 mt-4 flex-row items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
          <Lock size={16} className="text-primary" />
          <Text size="xs" variant="muted" className="flex-1 leading-relaxed">
            <Text size="xs" weight="semibold" className="text-foreground">Private by design. </Text>
            Your voice is processed in the moment and never recorded, stored, or sent anywhere. No camera is used.
          </Text>
        </Animated.View>

        {isVoice ? (
          <View className="mt-2 px-5">
            <MicOrb listening={listening} />

            {listening ? (
              <Animated.View entering={FadeIn} className="items-center">
                <Text size="sm" weight="medium" className="text-primary">
                  Listening… take your time
                </Text>
              </Animated.View>
            ) : captured ? (
              <Animated.View entering={FadeInDown} className="rounded-2xl border border-border bg-card p-4">
                <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
                  What I heard
                </Text>
                <Text size="base" className="mt-2 italic leading-relaxed text-card-foreground">
                  “{captured}”
                </Text>
                <Pressable onPress={() => { setCaptured(null); setPickedId(null); }} className="mt-3 self-start">
                  <Text size="xs" weight="semibold" className="text-primary">Not quite — say it again</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <>
                <Text size="sm" variant="muted" className="mb-3 text-center">
                  Tap a prompt to hear how it works — or just start talking.
                </Text>
                {VOICE_PROMPTS.map((p, i) => (
                  <View key={p} className="mb-2 flex-row items-start gap-2 rounded-xl bg-muted px-4 py-3">
                    <Text size="xs" weight="bold" className="mt-0.5 text-accent">{i + 1}</Text>
                    <Text size="sm" className="flex-1 leading-relaxed text-foreground">{p}</Text>
                  </View>
                ))}
                <Text size="xs" weight="semibold" className="mb-2 mt-4 uppercase tracking-widest text-muted-foreground">
                  Try one of these
                </Text>
                {SAMPLE_SCENARIOS.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => simulateVoice(s.id, s.spokenExample)}
                    className="mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <Mic size={16} className="text-primary" />
                    <Text size="sm" className="flex-1 leading-snug text-card-foreground">“{s.spokenExample}”</Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        ) : (
          <View className="mt-3 px-5">
            <View className="mb-3">
              {VOICE_PROMPTS.map((p) => (
                <View key={p} className="mb-1.5 flex-row items-start gap-2">
                  <Pencil size={12} className="mt-1 text-muted-foreground" />
                  <Text size="xs" variant="muted" className="flex-1 leading-relaxed">{p}</Text>
                </View>
              ))}
            </View>
            <View className="rounded-2xl border border-input bg-card p-3">
              <TextInput
                multiline
                value={typed}
                onChangeText={setTyped}
                placeholder="e.g. I'm in a park with a bench and some open grass, wearing leggings and trainers…"
                placeholderTextColor="hsl(160, 8%, 55%)"
                className="min-h-[120px] text-base leading-relaxed text-foreground"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            <Text size="xs" variant="muted" className="mt-2">
              Imprecise is fine. If something’s unclear, I’ll just ask a quick follow-up.
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="h-14 rounded-2xl"
          disabled={!canProceed}
          onPress={proceed}
        >
          <Text weight="semibold" className="text-primary-foreground">
            Read my moment
          </Text>
        </Button>
      </View>
    </View>
  );
}
