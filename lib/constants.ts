import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(40 33% 97%)', // background
    border: 'hsl(150 14% 87%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(6 62% 52%)', // destructive
    primary: 'hsl(162 32% 26%)', // primary
    text: 'hsl(160 18% 14%)', // foreground
  },
  dark: {
    background: 'hsl(165 22% 8%)', // background
    border: 'hsl(165 12% 20%)', // border
    card: 'hsl(165 18% 11%)', // card
    notification: 'hsl(6 60% 56%)', // destructive
    primary: 'hsl(158 42% 60%)', // primary
    text: 'hsl(40 30% 95%)', // foreground
  },
};

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.dark,
};
