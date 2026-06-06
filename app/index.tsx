import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Check, Mic, Moon, PersonStanding, Sparkles, Sun } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { Wordmark } from '@/components/Wordmark';
import { useSession } from '@/lib/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getExerciseImageSource } from '@/lib/exerciseImages';

const CHIPS = [
  { icon: Sparkles, label: 'Spontaneous', tint: true },
  { icon: Check, label: 'Zero prep', tint: false },
  { icon: Mic, label: 'Voice or text', tint: false },
];

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reset = useSession((s) => s.reset);
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: brand icon + wordmark, theme toggle */}
        <Animated.View
          entering={FadeIn.duration(450)}
          className="flex-row items-center justify-between px-5 pb-1"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="OUT n ABOUT — open settings and requirements"
            hitSlop={8}
            onPress={() => router.push('/settings')}
            className="flex-row items-center gap-2.5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent">
              <PersonStanding size={22} color="hsl(40, 40%, 98%)" strokeWidth={2.4} />
            </View>
            <Wordmark />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle light or dark mode"
            hitSlop={10}
            onPress={toggleColorScheme}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
          >
            {isDarkColorScheme ? (
              <Moon size={20} className="text-foreground" />
            ) : (
              <Sun size={20} className="text-foreground" />
            )}
          </Pressable>
        </Animated.View>

        {/* Hero card — sand surface, avatar in white ring */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} className="mt-3 px-5">
          <View className="items-center rounded-[28px] bg-secondary/70 px-6 pb-7 pt-6">
            <View className="flex-row items-center gap-2 self-start rounded-full bg-card px-3.5 py-2">
              <Sparkles size={14} className="text-accent" />
              <Text size="sm" weight="semibold" className="text-foreground">
                Your spot, your move
              </Text>
            </View>

            <View className="mt-5 h-36 w-36 items-center justify-center rounded-full bg-card p-1.5 shadow-sm">
              <Image
                source={getExerciseImageSource('avatar')}
                className="h-full w-full rounded-full"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </View>

            <Text size="xl" weight="bold" className="mt-5 text-accent">
              Ready when you are.
            </Text>
          </View>
        </Animated.View>

        {/* Headline block */}
        <Animated.View entering={FadeInDown.delay(160).duration(500)} className="mt-7 px-5">
          <Text size="xs" weight="bold" className="uppercase tracking-[3px] text-accent">
            No gym · No gear · No plan
          </Text>
          <Text weight="bold" className="mt-3 text-[40px] leading-[1.05] text-foreground">
            Start right{'\n'}where you are.
          </Text>
          <Text size="lg" variant="muted" className="mt-4 leading-relaxed">
            Tell me where you are and what you’re wearing. I’ll turn this exact moment into a few moves
            that feel doable — built around whatever’s right there with you.
          </Text>

          {/* Feature chips */}
          <View className="mt-6 flex-row flex-wrap gap-2.5">
            {CHIPS.map((c) => {
              const Icon = c.icon;
              return (
                <View
                  key={c.label}
                  className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
                    c.tint ? 'border-accent/30 bg-accent/10' : 'border-border bg-card'
                  }`}
                >
                  <Icon
                    size={15}
                    className={c.tint ? 'text-accent' : 'text-muted-foreground'}
                  />
                  <Text
                    size="sm"
                    weight="semibold"
                    className={c.tint ? 'text-accent' : 'text-foreground'}
                  >
                    {c.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky CTA — near-black pill */}
      <View
        className="absolute inset-x-0 bottom-0 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Find my spot"
          hapticFeedback="medium"
          onPress={() => {
            reset();
            router.push('/context');
          }}
          className="h-16 flex-row items-center justify-center gap-2.5 rounded-full bg-foreground"
        >
          <Text size="lg" weight="bold" className="text-background">
            Find my spot
          </Text>
          <ArrowRight size={20} className="text-background" />
        </AnimatedPressable>
        <Text size="sm" variant="muted" className="mt-3 text-center">
          Takes about 20 seconds. Nothing to set up first.
        </Text>
      </View>
    </View>
  );
}
