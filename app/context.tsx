import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
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
import { AlertCircle, Keyboard, Loader, Lock, Mic, Pencil, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SAMPLE_SCENARIOS, VOICE_PROMPTS, useSession } from '@/lib/store';
import { AI_ENABLED, transcribeAudio } from '@/lib/ai';
import { cn } from '@/lib/utils';

type MicState = 'idle' | 'recording' | 'transcribing' | 'error';

// Turn the raw error thrown by the voice pipeline into a clear, actionable
// message so the user (and you) can see exactly what broke instead of a
// generic "couldn't catch that".
function explainVoiceError(raw: string): string {
  if (raw.includes('NO_URI')) {
    return 'The recording came back empty — hold the orb a touch longer, then tap to stop. Or type instead.';
  }
  if (raw.startsWith('TRANSCRIBE_401') || raw.includes('Incorrect API key') || raw.includes('invalid_api_key')) {
    return 'Voice isn’t working: the OpenAI API key was rejected (401). Check the key, then try again — or type instead.';
  }
  if (raw.startsWith('TRANSCRIBE_429') || raw.includes('quota')) {
    return 'Voice is rate-limited or out of OpenAI credit (429). Try again shortly, or type your description instead.';
  }
  if (raw.startsWith('TRANSCRIBE_400')) {
    return 'The audio format wasn’t accepted (400). Try recording again, or type instead.';
  }
  if (raw.includes('TRANSCRIBE_EMPTY')) {
    return 'I heard silence. Speak a little closer and longer, then tap to stop — or type instead.';
  }
  if (raw.startsWith('TRANSCRIBE_5')) {
    return 'OpenAI had a server hiccup. Give it another go in a moment, or type instead.';
  }
  if (raw.includes('Network') || raw.includes('fetch')) {
    return 'I couldn’t reach the transcription service — check your connection, then try again or type instead.';
  }
  return `I couldn’t quite catch that (${raw}). Give it another go, or type instead.`;
}

function MicOrb({ active }: { active: boolean }) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (active) {
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
  }, [active, scale, ring]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 - ring.value * 0.5,
    transform: [{ scale: 1 + ring.value * 0.9 }],
  }));

  return (
    <View className="h-44 items-center justify-center">
      <Animated.View style={ringStyle} className="absolute h-36 w-36 rounded-full border-2 border-primary" />
      <Animated.View style={orbStyle}>
        <View
          className={cn(
            'h-28 w-28 items-center justify-center rounded-full',
            active ? 'bg-primary' : 'bg-secondary',
          )}
        >
          {active ? (
            <Square size={30} color="white" fill="white" />
          ) : (
            <Mic size={36} color="hsl(162, 32%, 26%)" />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

export default function ContextFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { inputMode, setInputMode, interpretLive } = useSession();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [micState, setMicState] = useState<MicState>('idle');
  const [captured, setCaptured] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [typed, setTyped] = useState('');

  const isVoice = inputMode === 'voice';
  const isRecording = recorderState.isRecording || micState === 'recording';

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true }).catch(() => {});
  }, []);

  async function startRecording() {
    setErrorMsg(null);
    setCaptured(null);
    try {
      // Check current status first, only prompt if not yet decided. In Expo Go
      // the native microphone permission string isn't present, so the request
      // can resolve denied even when the user wants to allow it — surface that
      // clearly and steer them to typing or a development build.
      let perm = await AudioModule.getRecordingPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) {
        perm = await AudioModule.requestRecordingPermissionsAsync();
      }
      if (!perm.granted) {
        setMicState('error');
        setErrorMsg(
          Constants.appOwnership === 'expo'
            ? 'Voice recording needs microphone access, which Expo Go can’t grant for this app. Type your description below — or run a development build to speak.'
            : 'I need microphone access to hear you. Enable it in Settings, or switch to typing below.',
        );
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setMicState('recording');
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setMicState('error');
      setErrorMsg(
        Constants.appOwnership === 'expo'
          ? 'Couldn’t start recording in Expo Go — microphone capture needs a development build. Type your description below to keep going.'
          : 'Couldn’t start recording. Try again, or switch to typing.',
      );
    }
  }

  async function stopRecording() {
    try {
      await recorder.stop();
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = recorder.uri;
      if (!uri) throw new Error('NO_URI');

      if (!AI_ENABLED) {
        // No key — be honest and let them type instead.
        setMicState('error');
        setErrorMsg('Voice transcription isn’t configured. Type your description below and I’ll still read your moment.');
        return;
      }

      setMicState('transcribing');
      const text = await transcribeAudio(uri);
      setCaptured(text);
      setMicState('idle');
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setMicState('error');
      const raw = e instanceof Error ? e.message : String(e);
      setErrorMsg(explainVoiceError(raw));
    }
  }

  function onOrbPress() {
    if (isRecording) void stopRecording();
    else void startRecording();
  }

  async function proceed() {
    const description = isVoice ? (captured ?? '') : typed.trim();
    if (!description) return;
    router.push('/interpreting');
    // Kick off live AI generation; the interpreting screen waits on `generating`.
    void interpretLive(description);
  }

  function tryExample(spoken: string) {
    // Lets reviewers experience the flow without speaking; still runs the real LLM.
    setCaptured(spoken);
    setMicState('idle');
    setErrorMsg(null);
  }

  const canProceed = isVoice ? !!captured : typed.trim().length > 8;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader eyebrow="Set your moment" showBack />
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
            Your voice is transcribed in the moment to read your surroundings, then discarded — never recorded, stored, or used to train anything. No camera is used.
          </Text>
        </Animated.View>

        {isVoice ? (
          <View className="mt-2 px-5">
            <Pressable onPress={onOrbPress} accessibilityRole="button" accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}>
              <MicOrb active={isRecording} />
            </Pressable>

            {micState === 'recording' ? (
              <Animated.View entering={FadeIn} className="items-center">
                <Text size="sm" weight="medium" className="text-primary">
                  Listening… tap when you’re done
                </Text>
              </Animated.View>
            ) : micState === 'transcribing' ? (
              <Animated.View entering={FadeIn} className="flex-row items-center justify-center gap-2">
                <Loader size={16} className="text-primary" />
                <Text size="sm" weight="medium" className="text-primary">
                  Catching your words…
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
                <Pressable
                  onPress={() => { setCaptured(null); setErrorMsg(null); }}
                  className="mt-3 self-start"
                >
                  <Text size="xs" weight="semibold" className="text-primary">Not quite — say it again</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <>
                <Text size="sm" variant="muted" className="mb-3 text-center">
                  Tap the mic and just start talking. Tap again when you’re done.
                </Text>
                {VOICE_PROMPTS.map((p, i) => (
                  <View key={p} className="mb-2 flex-row items-start gap-2 rounded-xl bg-muted px-4 py-3">
                    <Text size="xs" weight="bold" className="mt-0.5 text-accent">{i + 1}</Text>
                    <Text size="sm" className="flex-1 leading-relaxed text-foreground">{p}</Text>
                  </View>
                ))}
                <Text size="xs" weight="semibold" className="mb-2 mt-4 uppercase tracking-widest text-muted-foreground">
                  Or try one of these
                </Text>
                {SAMPLE_SCENARIOS.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => tryExample(s.spokenExample)}
                    className="mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <Mic size={16} className="text-primary" />
                    <Text size="sm" className="flex-1 leading-snug text-card-foreground">“{s.spokenExample}”</Text>
                  </Pressable>
                ))}
              </>
            )}

            {errorMsg ? (
              <Animated.View entering={FadeIn} className="mt-3 flex-row gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5">
                <AlertCircle size={16} className="text-destructive" />
                <Text size="xs" className="flex-1 leading-relaxed text-foreground/85">{errorMsg}</Text>
              </Animated.View>
            ) : null}
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
        <Button size="lg" className="h-16 rounded-2xl" disabled={!canProceed} onPress={proceed}>
          <Text weight="semibold" className="text-primary-foreground">
            Read my moment
          </Text>
        </Button>
      </View>
    </View>
  );
}
