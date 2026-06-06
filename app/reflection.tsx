import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Flame, MapPin, Sparkles, Timer } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSession } from '@/lib/store';

export default function Reflection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scenario, streak, history, reset } = useSession();

  const completedNames = scenario?.exercises.map((e) => e.name) ?? [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.duration(450)} className="items-center px-5">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 size={40} color="white" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(450)} className="mt-5 items-center px-7">
          <Text size="2xl" weight="bold" className="text-center leading-tight">
            You did it — right where you were.
          </Text>
          <Text size="sm" variant="muted" className="mt-2 text-center leading-relaxed">
            No gym, no plan, no special kit. You turned an ordinary moment into movement. That’s the
            whole point.
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeIn.delay(300)} className="mt-6 flex-row gap-3 px-5">
          <View className="flex-1 items-center rounded-2xl border border-border bg-card p-4">
            <Timer size={18} className="text-primary" />
            <Text size="lg" weight="bold" className="mt-1">
              ~12 min
            </Text>
            <Text size="xs" variant="muted">
              moving
            </Text>
          </View>
          <View className="flex-1 items-center rounded-2xl border border-border bg-card p-4">
            <Sparkles size={18} className="text-primary" />
            <Text size="lg" weight="bold" className="mt-1">
              {completedNames.length}
            </Text>
            <Text size="xs" variant="muted">
              moves done
            </Text>
          </View>
          <View className="flex-1 items-center rounded-2xl border border-border bg-card p-4">
            <Flame size={18} className="text-accent" />
            <Text size="lg" weight="bold" className="mt-1">
              {streak}
            </Text>
            <Text size="xs" variant="muted">
              day streak
            </Text>
          </View>
        </Animated.View>

        {/* What you did */}
        <Animated.View entering={FadeInDown.delay(380).duration(450)} className="mx-5 mt-5">
          <View className="overflow-hidden rounded-2xl">
            <LinearGradient
              colors={['hsl(162, 34%, 24%)', 'hsl(162, 30%, 17%)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 18 }}
            >
              <Text size="xs" weight="semibold" className="uppercase tracking-widest text-white/60">
                Today’s spontaneous session
              </Text>
              {completedNames.map((name) => (
                <View key={name} className="mt-2 flex-row items-center gap-2">
                  <CheckCircle2 size={15} color="hsl(158, 42%, 70%)" />
                  <Text size="sm" weight="medium" className="text-white">
                    {name}
                  </Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Confidence reinforcement */}
        <Animated.View entering={FadeInDown.delay(460).duration(450)} className="mx-5 mt-4">
          <View className="rounded-2xl bg-secondary/60 p-4">
            <Text size="sm" weight="semibold" className="text-foreground">
              The more you do this, the easier starting gets.
            </Text>
            <Text size="xs" variant="muted" className="mt-1 leading-relaxed">
              Next time you’re out and feel a flicker of “maybe I could” — that’s the moment.
              You already know it works.
            </Text>
          </View>
        </Animated.View>

        {history.length > 1 ? (
          <View className="mx-5 mt-4">
            <Text size="xs" weight="semibold" className="mb-2 uppercase tracking-widest text-muted-foreground">
              Recent moments
            </Text>
            {history.slice(0, 4).map((h) => (
              <View key={h.id} className="mb-2 flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                <MapPin size={14} className="text-primary" />
                <Text size="xs" className="flex-1 text-card-foreground">
                  {h.exerciseNames.length} moves · {h.durationLabel}
                </Text>
                <Text size="xs" variant="muted">
                  just now
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="h-16 rounded-2xl"
          onPress={() => {
            reset();
            router.dismissAll?.();
            router.replace('/');
          }}
        >
          <Text weight="semibold" className="text-primary-foreground">
            Done for now
          </Text>
        </Button>
        <Button
          variant="ghost"
          className="mt-1"
          onPress={() => {
            reset();
            router.replace('/context');
          }}
        >
          <Text weight="semibold" className="text-foreground">
            Go again somewhere new
          </Text>
        </Button>
      </View>
    </View>
  );
}
