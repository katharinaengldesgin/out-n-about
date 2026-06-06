import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Wordmark } from '@/components/Wordmark';
import { cn } from '@/lib/utils';

interface Props {
  /** small caption above content, e.g. "Step 1 of 3" */
  eyebrow?: string;
  showGear?: boolean;
  showWordmark?: boolean;
  /** show a leading back button */
  showBack?: boolean;
  /** custom handler for the back button; defaults to router.back() */
  onBack?: () => void;
  className?: string;
}

/**
 * Shared top bar. Gear (Settings/requirements) is reachable from the main flow.
 */
export function ScreenHeader({
  eyebrow,
  showGear = true,
  showWordmark = true,
  showBack = false,
  onBack,
  className,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  return (
    <View
      className={cn('flex-row items-center justify-between px-5', className)}
      style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
    >
      <View className="flex-row items-center gap-3">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
          >
            <ChevronLeft size={22} className="text-secondary-foreground" />
          </Pressable>
        ) : null}
        <View>
          {eyebrow ? (
            <Text size="xs" weight="semibold" className="mb-0.5 uppercase tracking-widest text-accent">
              {eyebrow}
            </Text>
          ) : null}
          {showWordmark ? <Wordmark /> : null}
        </View>
      </View>
      {showGear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings and design requirements"
          hitSlop={12}
          onPress={() => router.push('/settings')}
          className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
        >
          <Settings size={20} className="text-secondary-foreground" />
        </Pressable>
      ) : null}
    </View>
  );
}
