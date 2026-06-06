// ---------------------------------------------------------------------------
// OUT n ABOUT — real AI layer.
// Whisper transcribes the user's spoken description; GPT reads that description
// and returns a fully-formed Scenario (the Mirror reflection + confidence-tagged
// signals + a context-appropriate, expert-framed workout = the Repository).
//
// Everything degrades gracefully: if there is no API key, or the network/model
// fails, we fall back to the prewritten keyword-matched scenarios so the
// prototype always works.
// ---------------------------------------------------------------------------

import type { Exercise, InterpretedSignal, Scenario } from '@/lib/store';
import { matchScenario } from '@/lib/store';
import Constants from 'expo-constants';

// The key can arrive two ways: as an EXPO_PUBLIC_* env var inlined at bundle
// time (when a .env file exists), or via app.config.ts -> extra (read from the
// sandbox shell env at config-eval time). Try both so it works either way.
const OPENAI_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  (Constants.expoConfig?.extra?.openaiApiKey as string | undefined) ||
  '';
const CHAT_MODEL = 'gpt-4o-mini';
const TRANSCRIBE_MODEL = 'whisper-1';

export const AI_ENABLED = OPENAI_KEY.length > 0;

// ---------------------------------------------------------------------------
// Transcription (Whisper)
// ---------------------------------------------------------------------------

/**
 * Transcribe a recorded audio file (local file URI on native, blob URL on web)
 * into text using Whisper. Audio is sent once, transcribed, and never stored.
 */
export async function transcribeAudio(uri: string): Promise<string> {
  if (!AI_ENABLED) throw new Error('NO_KEY');

  const form = new FormData();

  // Fetch the recorded file into a blob and append it. This works on web and
  // on native (where fetch() on a file:// URI yields a blob).
  const fileResp = await fetch(uri);
  const blob = await fileResp.blob();
  const ext = guessExtension(uri, blob.type);
  // FormData on RN accepts a { uri, name, type } shape; on web we append the blob.
  if (typeof File !== 'undefined') {
    form.append('file', new File([blob], `clip.${ext}`, { type: blob.type || `audio/${ext}` }));
  } else {
    // React Native FormData
    form.append('file', {
      // @ts-expect-error RN FormData file shape
      uri,
      name: `clip.${ext}`,
      type: blob.type || `audio/${ext}`,
    });
  }
  form.append('model', TRANSCRIBE_MODEL);
  form.append('language', 'en');

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: form,
  });

  if (!resp.ok) {
    throw new Error(`TRANSCRIBE_${resp.status}`);
  }
  const data = (await resp.json()) as { text?: string };
  const text = (data.text ?? '').trim();
  if (!text) throw new Error('TRANSCRIBE_EMPTY');
  return text;
}

function guessExtension(uri: string, mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  const m = uri.split('.').pop()?.split('?')[0];
  return m && m.length <= 4 ? m : 'm4a';
}

// ---------------------------------------------------------------------------
// Interpretation (GPT -> Scenario)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the invisible intelligence behind OUT n ABOUT, an app that helps people — especially women who feel hesitant exercising in public — start a spontaneous street workout right where they are.

The user describes, in their own words (by voice or text), their surroundings, what they are wearing, and any conditions. You NEVER see them — you only have their words. From this you reflect their situation back to them and suggest feasible, confidence-building exercises that use what is actually around them.

Embody three roles at once:
- COMPANION: warm, motivating, encouraging, never judgmental, never guilt-inducing. Second person ("you").
- REPOSITORY: credible, expert movement knowledge — clear steps, real form cues, sensible alternatives.
- MIRROR: reflect the user's EXACT described situation back, citing their own words, so every suggestion obviously fits their moment.

Rules:
- Only infer from what the user actually said. If something is ambiguous or missing, lower your confidence and raise ONE honest, calm follow-up question instead of guessing.
- Tailor to clothing/movement constraints (e.g. skirt -> standing & modest; backpack -> upright; jeans -> no deep ranges) and conditions (wet ground -> no floor work; busy/low-privacy -> movements that look ordinary).
- Suggest 3 exercises. Mix difficulties. Each must use something the user described.
- Keep copy plain-language, calm, and confidence-first. No hype, no clichés, no medical claims.

Respond with ONLY a JSON object matching the provided schema. No markdown, no prose outside JSON.`;

interface RawAIScenario {
  reflection: string;
  followUp?: string | null;
  signals: {
    label: string;
    kind: InterpretedSignal['kind'];
    note: string;
    confidence: InterpretedSignal['confidence'];
  }[];
  exercises: {
    name: string;
    rationale: string;
    focus: string;
    duration: string;
    reps: string;
    difficulty: Exercise['difficulty'];
    uses: string;
    steps: { title: string; detail: string }[];
    formTips: string[];
    confidenceCue: string;
    alternatives: { name: string; why: string }[];
  }[];
}

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reflection', 'followUp', 'signals', 'exercises'],
  properties: {
    reflection: { type: 'string' },
    followUp: { type: ['string', 'null'] },
    signals: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'kind', 'note', 'confidence'],
        properties: {
          label: { type: 'string' },
          kind: { type: 'string', enum: ['environment', 'clothing', 'conditions'] },
          note: { type: 'string' },
          confidence: { type: 'string', enum: ['clear', 'likely', 'unsure'] },
        },
      },
    },
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'name',
          'rationale',
          'focus',
          'duration',
          'reps',
          'difficulty',
          'uses',
          'steps',
          'formTips',
          'confidenceCue',
          'alternatives',
        ],
        properties: {
          name: { type: 'string' },
          rationale: { type: 'string' },
          focus: { type: 'string' },
          duration: { type: 'string' },
          reps: { type: 'string' },
          difficulty: { type: 'string', enum: ['Gentle', 'Steady', 'Spicy'] },
          uses: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'detail'],
              properties: { title: { type: 'string' }, detail: { type: 'string' } },
            },
          },
          formTips: { type: 'array', items: { type: 'string' } },
          confidenceCue: { type: 'string' },
          alternatives: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'why'],
              properties: { name: { type: 'string' }, why: { type: 'string' } },
            },
          },
        },
      },
    },
  },
} as const;

function slugify(s: string, i: number): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'move'}-${i}`;
}

/**
 * Ask GPT to interpret the user's free-text description and return a Scenario.
 * Falls back to the prewritten keyword matcher on any failure.
 */
export async function interpretWithAI(description: string): Promise<Scenario> {
  const text = description.trim();
  if (!AI_ENABLED || text.length === 0) {
    return matchScenario(text);
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Here is exactly what I said about my situation:\n\n"${text}"\n\nRead my moment and build my session.`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'scenario', strict: true, schema: RESPONSE_SCHEMA },
        },
      }),
    });

    if (!resp.ok) throw new Error(`CHAT_${resp.status}`);
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('CHAT_EMPTY');

    const raw = JSON.parse(content) as RawAIScenario;
    return normalize(raw, text);
  } catch {
    // Honest, calm degradation — the user still gets a usable session.
    return matchScenario(text);
  }
}

function normalize(raw: RawAIScenario, description: string): Scenario {
  const exercises: Exercise[] = (raw.exercises ?? []).slice(0, 4).map((e, i) => ({
    id: slugify(e.name, i),
    name: e.name,
    rationale: e.rationale,
    focus: e.focus,
    duration: e.duration,
    reps: e.reps,
    difficulty: e.difficulty,
    uses: e.uses,
    steps: e.steps ?? [],
    formTips: e.formTips ?? [],
    confidenceCue: e.confidenceCue,
    alternatives: e.alternatives ?? [],
  }));

  return {
    id: `ai-${Date.now()}`,
    spokenExample: description,
    reflection: raw.reflection,
    signals: (raw.signals ?? []).map((s) => ({
      label: s.label,
      kind: s.kind,
      note: s.note,
      confidence: s.confidence,
    })),
    followUp: raw.followUp ?? undefined,
    exercises: exercises.length > 0 ? exercises : matchScenario(description).exercises,
  };
}
