import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/**
 * OUT n ABOUT wordmark. The "n" is the warm-accent pivot — small human touch.
 */
export function Wordmark({ size = 'base', className }: { size?: 'base' | 'lg'; className?: string }) {
  const big = size === 'lg';
  return (
    <View className={cn('flex-row items-baseline', className)}>
      <Text weight="bold" className={cn('tracking-tight text-foreground', big ? 'text-2xl' : 'text-lg')}>
        OUT
      </Text>
      <Text weight="bold" className={cn('px-0.5 text-accent', big ? 'text-2xl' : 'text-lg')}>
        n
      </Text>
      <Text weight="bold" className={cn('tracking-tight text-foreground', big ? 'text-2xl' : 'text-lg')}>
        ABOUT
      </Text>
    </View>
  );
}
