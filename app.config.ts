import type { ConfigContext, ExpoConfig } from '@expo/config';

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }], 'react-native-maps']
      : [];

  return {
    ...config,
    name: 'OUT n ABOUT',
    slug: 'out-n-about',
    newArchEnabled: true,
    version: process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'out-n-about',
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: process.env.BILT_IOS_BUNDLE_ID ?? 'me.bilt.outnabout',
    },
    android: {
      package: process.env.BILT_ANDROID_PACKAGE ?? 'me.bilt.outnabout',
    },
    extra: {
      appStoreAppId: process.env.BILT_APP_STORE_APP_ID,
      // Surface the OpenAI key through runtime config so it's available even
      // when no .env file is present (the sandbox provides it as a shell env var).
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-audio',
        {
          microphonePermission:
            'OUT n ABOUT uses your microphone only while you describe your surroundings. Audio is transcribed in the moment and never stored.',
        },
      ],
      ...nativePlugins,
    ],
    experiments: {
      typedRoutes: true,
    }
  };
};
