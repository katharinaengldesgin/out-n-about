import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Heart, MapPin, Mic, Shield, Sparkles } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Wordmark } from '@/components/Wordmark';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSession } from '@/lib/store';

const PROMISES = [
  {
    icon: MapPin,
    title: 'Start right where you are',
    body: 'A park, a stairwell, a quiet courtyard. No gym, no gear, no plan. Wherever you’re standing is the starting line.',
  },
  {
    icon: Heart,
    title: 'No prep, no fitness level needed',
    body: 'You don’t need to be ready, changed, or warmed up. We meet you exactly as you are, today.',
  },
  {
    icon: Compass,
    title: 'Your moment shapes the workout',
    body: 'It’s not only about you — the bench, the steps, what you’re wearing, the wet ground all matter. We read the whole picture.',
  },
];

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reset = useSession((s) => s.reset);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader showWordmark={false} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeIn.duration(500)} className="px-5 pt-2">
          <View className="overflow-hidden rounded-[28px]">
            <LinearGradient
              colors={['hsl(162, 34%, 24%)', 'hsl(162, 30%, 16%)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24, paddingTop: 28, paddingBottom: 30 }}
            >
              <View className="mb-5 flex-row items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1.5">
                <Sparkles size={14} color="hsl(18, 65%, 70%)" />
                <Text size="xs" weight="semibold" className="text-white/90">
                  Your confidence engine for moving outdoors
                </Text>
              </View>
              <Wordmark size="lg" className="mb-4" />
              <Text size="3xl" weight="bold" className="leading-tight text-white">
                Spontaneous movement,{'\n'}made simple.
              </Text>
              <Text size="base" className="mt-3 leading-relaxed text-white/75">
                Tell us where you are and what you’re wearing. We’ll turn this exact moment into a few
                doable moves — so the hardest part, starting, feels easy.
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Promise cards */}
        <View className="mt-7 px-5">
          {PROMISES.map((p, i) => {
            const Icon = p.icon;
            return (
              <Animated.View
                key={p.title}
                entering={FadeInDown.delay(120 + i * 90).duration(450)}
                className="mb-3 flex-row gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
                  <Icon size={20} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text weight="semibold" className="text-card-foreground">
                    {p.title}
                  </Text>
                  <Text size="sm" variant="muted" className="mt-1 leading-relaxed">
                    {p.body}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Voice + privacy note */}
        <Animated.View entering={FadeInDown.delay(420).duration(450)} className="mt-2 px-5">
          <View className="flex-row items-center gap-3 rounded-2xl bg-secondary/60 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Mic size={18} color="white" />
            </View>
            <View className="flex-1">
              <Text size="sm" weight="semibold">
                You’ll describe it in your own words
              </Text>
              <Text size="xs" variant="muted" className="mt-0.5 flex-row leading-relaxed">
                Speak or type — no camera, ever. Nothing is recorded or stored.
              </Text>
            </View>
            <Shield size={18} className="text-muted-foreground" />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="h-14 rounded-2xl"
          onPress={() => {
            reset();
            router.push('/context');
          }}
        >
          <Text weight="semibold" className="text-primary-foreground">
            I’m out and about — let’s go
          </Text>
        </Button>
        <Text size="xs" variant="muted" className="mt-2 text-center">
          Takes about 20 seconds to set up your moment.
        </Text>
      </View>
    </View>
  );
}
