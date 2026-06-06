import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Eye,
  Hand,
  Lock,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Wordmark } from '@/components/Wordmark';

interface Requirement {
  icon: typeof Mic;
  area: string;
  question: string;
  manifested: string;
}

const REQUIREMENTS: Requirement[] = [
  {
    icon: Sparkles,
    area: 'Mental model',
    question: 'Human/Companion, supported by Knowledge Repository and Mirror.',
    manifested:
      'Companion: warm second-person copy and rotating encouragement during the workout. Repository: every move has form steps, focus area, and expert alternatives in the library detail. Mirror: the app reflects your exact spoken description back to you before generating anything, and each suggestion cites what you said.',
  },
  {
    icon: Mic,
    area: 'Input modality',
    question: 'Voice-first context gathering, with a typed fallback.',
    manifested:
      'The context screen opens to a conversational mic orb with low-pressure prompts. A clearly-labelled toggle switches to a typed description using the same prompts. No camera or image input appears anywhere in the app.',
  },
  {
    icon: Lock,
    area: 'Privacy',
    question: 'Nothing recorded or stored; reassure at the point of input.',
    manifested:
      'A calm privacy banner sits directly above the voice input: \u201cprocessed in the moment, never recorded, stored, or sent.\u201d Reinforced on the landing screen. No microphone-recording-for-storage and no image capture are ever requested.',
  },
  {
    icon: Eye,
    area: 'Environment matters',
    question: 'Correct the idea that it\u2019s only about the user.',
    manifested:
      'The landing screen states \u201cyour moment shapes the workout \u2014 it\u2019s not only about you.\u201d Signals are split into Around you / Wearing / Conditions, and every rationale ties a move to an environmental feature (bench, stairs, wall, wet ground).',
  },
  {
    icon: BookOpen,
    area: 'Trust & transparency',
    question: 'Capability reminders, source transparency, reasoning explanations.',
    manifested:
      'Each signal carries a Clear / Likely / Unsure confidence tag (capability + transparency). Every exercise shows an explicit \u201cWhy this fits your moment\u201d rationale (reasoning). A plain-language note states what the AI can and cannot infer from words alone.',
  },
  {
    icon: ShieldCheck,
    area: 'Limits & medical disclaimer',
    question: 'An honest, well-placed statement of limits \u2014 not a legal afterthought.',
    manifested:
      'Placed on the recommendations screen where it\u2019s relevant: the AI can\u2019t see you, so it can\u2019t judge balance, injury, or pain; move at your pace, stop if it hurts, and this is not medical advice.',
  },
  {
    icon: Hand,
    area: 'User control',
    question: 'AI acts, user oversees \u2014 Explain, Preview, Clarify.',
    manifested:
      'Explain: rationale on every suggestion. Preview: the recommendations screen previews the full session before you start, and the CTA reads \u201cPreview & start.\u201d Clarify/override: swap out or restore moves, re-describe your moment, and view alternatives per exercise.',
  },
  {
    icon: MessageCircle,
    area: 'Honest error handling',
    question: 'If uncertain, say so and ask a simple follow-up rather than guessing.',
    manifested:
      'When a description is ambiguous (e.g. unknown backpack weight or slippery ground), a calm \u201cOne quick check\u201d card asks a single follow-up instead of pretending certainty.',
  },
  {
    icon: Users,
    area: 'Tone & audience',
    question: 'Motivating without pressure; emotionally safe, especially for hesitant women.',
    manifested:
      'Copy never implies guilt or \u201cyou should exercise more.\u201d Confidence cues note that moves look unremarkable in public. No human persona beyond the app name; warmth lives in microcopy and button labels.',
  },
];

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between px-5 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View>
          <Text size="xs" weight="semibold" className="mb-0.5 uppercase tracking-widest text-accent">
            Design requirements
          </Text>
          <Wordmark />
        </View>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-secondary"
          onPress={() => router.back()}
        >
          <X size={18} className="text-secondary-foreground" />
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <Text size="sm" variant="muted" className="leading-relaxed">
            How OUT n ABOUT answers each design brief area — and exactly how it shows up in the product.
          </Text>
        </View>

        <View className="mt-5 px-5">
          {REQUIREMENTS.map((r, i) => {
            const Icon = r.icon;
            return (
              <View key={r.area} className="mb-3 rounded-2xl border border-border bg-card p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Icon size={17} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text size="xs" weight="semibold" className="uppercase tracking-widest text-muted-foreground">
                      {String(i + 1).padStart(2, '0')} · {r.area}
                    </Text>
                    <Text size="sm" weight="semibold" className="mt-0.5 text-card-foreground">
                      {r.question}
                    </Text>
                  </View>
                </View>
                <View className="mt-3 rounded-xl bg-secondary/50 p-3">
                  <Text size="xs" weight="semibold" className="uppercase tracking-widest text-accent">
                    How it’s manifested
                  </Text>
                  <Text size="xs" className="mt-1 leading-relaxed text-foreground/85">
                    {r.manifested}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mx-5 mt-2 rounded-2xl bg-muted/60 p-4">
          <Text size="xs" variant="muted" className="leading-relaxed">
            Prototype note: AI behaviour is simulated with prewritten analysis and sample scenarios. There
            is no backend, no recording, and no image input — by design.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
