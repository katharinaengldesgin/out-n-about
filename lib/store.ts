import { create } from 'zustand';

// ---------------------------------------------------------------------------
// OUT n ABOUT — mock "AI" engine + session store.
// No backend. The AI is simulated through prewritten scenario interpretations
// keyed off whichever sample context the user picks (or by simple keyword
// matching on free text). This is what powers the Mirror + Repository feel.
// ---------------------------------------------------------------------------

export type InputMode = 'voice' | 'text';

export interface InterpretedSignal {
  /** Short label of what the AI noticed, e.g. "Bench nearby" */
  label: string;
  /** Which bucket: environment / clothing / conditions */
  kind: 'environment' | 'clothing' | 'conditions';
  /** Plain-language reflection of how the AI read it */
  note: string;
  /** Confidence the AI has in this inference */
  confidence: 'clear' | 'likely' | 'unsure';
}

export interface ExerciseStep {
  title: string;
  detail: string;
}

export interface Exercise {
  id: string;
  name: string;
  /** Why this was suggested, referencing the user's own words. The "Mirror". */
  rationale: string;
  /** The credible knowledge layer. The "Repository". */
  focus: string;
  duration: string;
  reps: string;
  difficulty: 'Gentle' | 'Steady' | 'Spicy';
  steps: ExerciseStep[];
  formTips: string[];
  confidenceCue: string;
  alternatives: { name: string; why: string }[];
  /** Equipment / surface this uses from the environment */
  uses: string;
}

export interface Scenario {
  id: string;
  /** What the user "said" — used in the prompt chips */
  spokenExample: string;
  /** Reflected-back summary the app shows before generating */
  reflection: string;
  signals: InterpretedSignal[];
  /** An honest follow-up the AI raises when something is ambiguous */
  followUp?: string;
  exercises: Exercise[];
}

// --- Prewritten scenarios ---------------------------------------------------

const SCENARIOS: Scenario[] = [
  {
    id: 'park-bench',
    spokenExample:
      "I'm in a park, there's a bench and some open grass. I'm wearing leggings and trainers.",
    reflection:
      'Open park with a sturdy bench and grass to work on. You\u2019re in leggings and trainers \u2014 free to move. Nothing wet, decent space around you.',
    signals: [
      {
        label: 'Park bench',
        kind: 'environment',
        note: 'A stable bench at roughly knee-to-hip height \u2014 great for elevated holds and step-based moves.',
        confidence: 'clear',
      },
      {
        label: 'Open grass',
        kind: 'environment',
        note: 'Soft, forgiving surface. Good for ground work without needing a mat.',
        confidence: 'clear',
      },
      {
        label: 'Leggings + trainers',
        kind: 'clothing',
        note: 'Full range of movement. No need to avoid wide stances or floor positions.',
        confidence: 'clear',
      },
      {
        label: 'Open, calm space',
        kind: 'conditions',
        note: 'Room to move and reasonable privacy. Picked movements that don\u2019t draw attention.',
        confidence: 'likely',
      },
    ],
    exercises: [
      {
        id: 'incline-push',
        name: 'Bench Incline Push-Up',
        rationale:
          'You mentioned a bench \u2014 hands on the seat raises your body, so this is noticeably easier than a floor push-up. A confident place to begin.',
        focus: 'Chest, shoulders & core \u00b7 upper-body pressing pattern',
        duration: '3 sets',
        reps: '8\u201312 reps',
        difficulty: 'Gentle',
        uses: 'The park bench',
        steps: [
          { title: 'Set up', detail: 'Hands on the bench edge, slightly wider than shoulders. Walk feet back into a straight line.' },
          { title: 'Lower', detail: 'Bend the elbows and bring your chest toward the bench, keeping your body in one line.' },
          { title: 'Press', detail: 'Push back up smoothly. Breathe out as you press.' },
        ],
        formTips: [
          'Keep your hips level with your shoulders \u2014 no sagging or peaking.',
          'The higher the surface, the easier it is. Start where you feel strong.',
        ],
        confidenceCue: 'Nobody can tell what level you\u2019re on. This looks the same whether it\u2019s rep 1 or rep 100.',
        alternatives: [
          { name: 'Wall push-up', why: 'If the bench feels low, a nearby wall or railing makes it gentler.' },
          { name: 'Knee push-up on grass', why: 'Prefer the ground? The grass is soft enough to drop a knee.' },
        ],
      },
      {
        id: 'step-up',
        name: 'Bench Step-Up',
        rationale:
          'The bench doubles as a step. This builds leg strength and balance and feels like everyday movement \u2014 nothing showy.',
        focus: 'Glutes & quads \u00b7 single-leg strength + balance',
        duration: '3 sets',
        reps: '10 per leg',
        difficulty: 'Steady',
        uses: 'The park bench',
        steps: [
          { title: 'Plant', detail: 'Place one whole foot flat on the bench seat.' },
          { title: 'Drive', detail: 'Push through that heel to stand tall on the bench.' },
          { title: 'Control', detail: 'Lower slowly back down. Don\u2019t just drop.' },
        ],
        formTips: [
          'Lead with the heel, not the toes, to keep it in the glutes.',
          'Only as high as feels stable \u2014 a lower step still counts.',
        ],
        confidenceCue: 'This reads as \u201cperson using a bench\u201d to anyone passing. Completely unremarkable.',
        alternatives: [
          { name: 'Bodyweight squat on grass', why: 'No stepping if balance feels off today \u2014 the grass gives you room.' },
        ],
      },
      {
        id: 'grass-glute-bridge',
        name: 'Grass Glute Bridge',
        rationale:
          'You said the grass is open and dry, so ground work is comfortable. This is low to the floor and very forgiving.',
        focus: 'Glutes & hamstrings \u00b7 posterior-chain activation',
        duration: '3 sets',
        reps: '12\u201315 reps',
        difficulty: 'Gentle',
        uses: 'The open grass',
        steps: [
          { title: 'Lie back', detail: 'On your back, knees bent, feet flat on the grass.' },
          { title: 'Lift', detail: 'Squeeze your glutes and lift your hips to a straight line from knee to shoulder.' },
          { title: 'Pause', detail: 'Hold for a breath at the top, then lower with control.' },
        ],
        formTips: [
          'Drive through your heels, not your lower back.',
          'A small squeeze at the top is worth more than lifting higher.',
        ],
        confidenceCue: 'Low to the ground and quiet \u2014 a private little reset even in a public park.',
        alternatives: [
          { name: 'Standing hip hinge', why: 'Rather stay upright? A standing good-morning works the same muscles.' },
        ],
      },
    ],
  },
  {
    id: 'street-stairs',
    spokenExample:
      "I'm on a city street near some stairs. I've got a backpack on and I'm in jeans.",
    reflection:
      'A city street with a flight of stairs close by. You\u2019ve got a backpack on and you\u2019re in jeans \u2014 so we\u2019ll keep movements compact and upright. Busier surroundings noted.',
    signals: [
      {
        label: 'Stairs / steps',
        kind: 'environment',
        note: 'A built-in adjustable height. Great for calves, cardio, and elevated pushes.',
        confidence: 'clear',
      },
      {
        label: 'Backpack on',
        kind: 'clothing',
        note: 'Added load on your back. I\u2019ll favour upright moves and skip anything where the bag swings or pulls you off balance.',
        confidence: 'clear',
      },
      {
        label: 'Jeans',
        kind: 'clothing',
        note: 'Limited stretch. Avoiding deep lunges and wide floor positions \u2014 keeping ranges comfortable.',
        confidence: 'likely',
      },
      {
        label: 'Busy street',
        kind: 'conditions',
        note: 'Less privacy and foot traffic. Chosen movements that look like ordinary street activity.',
        confidence: 'likely',
      },
    ],
    followUp:
      'You didn\u2019t mention whether the backpack is heavy \u2014 if it\u2019s loaded up, take a set off the standing moves and just use bodyweight.',
    exercises: [
      {
        id: 'calf-raise',
        name: 'Step Calf Raise',
        rationale:
          'Stairs let your heels drop below the step for a fuller range. With a backpack on, this stays upright and balanced \u2014 the load actually helps.',
        focus: 'Calves \u00b7 lower-leg strength + ankle stability',
        duration: '3 sets',
        reps: '15\u201320 reps',
        difficulty: 'Gentle',
        uses: 'The stairs',
        steps: [
          { title: 'Position', detail: 'Stand with the balls of your feet on a step edge, heels hanging off. Hold the rail.' },
          { title: 'Rise', detail: 'Push up onto your toes as high as you can.' },
          { title: 'Lower', detail: 'Let your heels sink below the step for a gentle stretch, then repeat.' },
        ],
        formTips: [
          'Keep a hand on the railing for balance with the bag on.',
          'Slow on the way down \u2014 that\u2019s where the strength is built.',
        ],
        confidenceCue: 'Looks exactly like someone pausing on the stairs. Totally invisible as a \u201cworkout.\u201d',
        alternatives: [
          { name: 'Flat-ground calf raise', why: 'If the step feels crowded, do it on flat pavement \u2014 still effective.' },
        ],
      },
      {
        id: 'stair-incline-push',
        name: 'Stair Incline Push',
        rationale:
          'Hands on a higher step keeps your body upright \u2014 so your backpack sits naturally and doesn\u2019t pull you down.',
        focus: 'Chest & shoulders \u00b7 pressing at a manageable angle',
        duration: '3 sets',
        reps: '8\u201310 reps',
        difficulty: 'Steady',
        uses: 'The stairs',
        steps: [
          { title: 'Set up', detail: 'Hands on a step that puts you at a comfortable angle, feet on the ground below.' },
          { title: 'Lower', detail: 'Bend the elbows, chest toward the step, body in one line.' },
          { title: 'Press', detail: 'Push back up. The higher the step, the lighter it feels.' },
        ],
        formTips: [
          'Pick a step high enough that your backpack doesn\u2019t shift your weight forward.',
          'Keep your core braced so the bag stays put.',
        ],
        confidenceCue: 'Quick and self-contained \u2014 you\u2019re up and moving again in seconds.',
        alternatives: [
          { name: 'Wall push-up', why: 'A nearby wall removes the floor angle entirely if the steps are busy.' },
        ],
      },
      {
        id: 'march-in-place',
        name: 'Loaded High March',
        rationale:
          'In jeans with a backpack, this is the simplest way to get your heart rate up without big ranges of motion. The bag adds gentle resistance.',
        focus: 'Cardio & core \u00b7 low-impact conditioning',
        duration: '4 rounds',
        reps: '30 seconds on',
        difficulty: 'Gentle',
        uses: 'Any flat spot',
        steps: [
          { title: 'Stand tall', detail: 'Feet hip-width, posture upright, core gently braced against the bag.' },
          { title: 'March', detail: 'Drive one knee up to hip height, then the other \u2014 brisk and controlled.' },
          { title: 'Breathe', detail: 'Steady rhythm. Pump the arms naturally.' },
        ],
        formTips: [
          'Stay tall \u2014 don\u2019t let the backpack round your shoulders forward.',
          'Knee height over speed. Control beats flailing.',
        ],
        confidenceCue: 'Reads as someone waiting or warming up. No equipment, no floor, no fuss.',
        alternatives: [
          { name: 'Brisk walk loop', why: 'Prefer to keep moving? Walk a tight loop at pace for the same effect.' },
        ],
      },
    ],
  },
  {
    id: 'tight-space',
    spokenExample:
      "Small courtyard, not much room. Ground's a bit wet. I'm in a skirt and flats.",
    reflection:
      'A small courtyard with limited room and a slightly wet ground. You\u2019re in a skirt and flats \u2014 so we\u2019ll keep everything standing, modest, and dry. Quiet, compact session.',
    signals: [
      {
        label: 'Wet ground',
        kind: 'conditions',
        note: 'No floor work and nothing that needs grip. Keeping you on your feet and stable.',
        confidence: 'clear',
      },
      {
        label: 'Skirt + flats',
        kind: 'clothing',
        note: 'Avoiding wide stances, deep squats and anything that feels exposed. Chosen modest, contained movements.',
        confidence: 'clear',
      },
      {
        label: 'Tight space',
        kind: 'environment',
        note: 'Limited room. Picked moves with a small footprint \u2014 nothing that travels.',
        confidence: 'clear',
      },
      {
        label: 'Limited privacy',
        kind: 'conditions',
        note: 'Likely overlooked. Everything here looks like natural standing movement.',
        confidence: 'likely',
      },
    ],
    followUp:
      'I couldn\u2019t tell how slippery the ground is \u2014 if your flats feel unsure underfoot, hold a wall for the standing moves.',
    exercises: [
      {
        id: 'wall-sit',
        name: 'Wall Sit',
        rationale:
          'With a wet ground and a skirt, this keeps you upright and dry while still working your legs hard. No floor contact at all.',
        focus: 'Quads & endurance \u00b7 isometric leg strength',
        duration: '3 sets',
        reps: '20\u201340 seconds',
        difficulty: 'Steady',
        uses: 'Any wall',
        steps: [
          { title: 'Lean', detail: 'Back flat against the wall, slide down until your thighs are as low as feels modest and stable.' },
          { title: 'Hold', detail: 'Knees over ankles, weight in your heels. Breathe steadily.' },
          { title: 'Rise', detail: 'Press through your heels to stand back up.' },
        ],
        formTips: [
          'You choose the depth \u2014 a higher sit is perfectly fine in a skirt.',
          'Keep your back flat against the wall the whole time.',
        ],
        confidenceCue: 'Completely still and contained \u2014 it just looks like you\u2019re leaning on a wall.',
        alternatives: [
          { name: 'Standing wall calf raise', why: 'If holding the sit feels exposed, calf raises keep it small and subtle.' },
        ],
      },
      {
        id: 'standing-march',
        name: 'Quiet Standing March',
        rationale:
          'Small footprint, fully upright, and modest \u2014 ideal for a tight courtyard in a skirt and flats. No grip needed on the wet ground.',
        focus: 'Cardio & balance \u00b7 gentle conditioning',
        duration: '4 rounds',
        reps: '30 seconds',
        difficulty: 'Gentle',
        uses: 'A dry patch',
        steps: [
          { title: 'Stand', detail: 'Tall posture, feet under hips on the driest spot you can find.' },
          { title: 'Lift', detail: 'Raise one knee to a comfortable, modest height, then the other.' },
          { title: 'Settle', detail: 'Keep it low-impact \u2014 quiet feet, controlled pace.' },
        ],
        formTips: [
          'Keep knee height modest \u2014 comfort and coverage come first.',
          'Soft landings to stay sure-footed on a damp surface.',
        ],
        confidenceCue: 'Looks like you\u2019re simply shifting your weight. Nobody reads it as exercise.',
        alternatives: [
          { name: 'Standing knee-to-elbow', why: 'Add a gentle twist for the core if you want a touch more.' },
        ],
      },
      {
        id: 'wall-push',
        name: 'Wall Push-Up',
        rationale:
          'A wall keeps you off the wet ground entirely and the upright angle works in any clothing. The most forgiving press there is.',
        focus: 'Chest & arms \u00b7 gentle upper-body pressing',
        duration: '3 sets',
        reps: '10\u201315 reps',
        difficulty: 'Gentle',
        uses: 'Any wall',
        steps: [
          { title: 'Set up', detail: 'Hands on the wall at chest height, step your feet back slightly.' },
          { title: 'Lower', detail: 'Bend the elbows, bring your chest toward the wall.' },
          { title: 'Press', detail: 'Push back to standing. The further your feet, the harder it gets.' },
        ],
        formTips: [
          'Stand closer to the wall to make it easier \u2014 you control the effort.',
          'Keep your body in one straight line, heels can stay down.',
        ],
        confidenceCue: 'Upright, modest, and quick. Perfect when space and privacy are tight.',
        alternatives: [
          { name: 'Wall angels', why: 'Swap the push for slow arm slides up the wall to open the shoulders.' },
        ],
      },
    ],
  },
];

// --- Keyword matcher for free-typed input ----------------------------------

function matchScenario(text: string): Scenario {
  const t = text.toLowerCase();
  const wet = /(wet|rain|damp|slippery|puddle)/.test(t);
  const skirt = /(skirt|dress|flats|heels)/.test(t);
  const stairs = /(stair|steps|backpack|jeans|street|city)/.test(t);
  if (wet || skirt) return SCENARIOS[2];
  if (stairs) return SCENARIOS[1];
  return SCENARIOS[0];
}

// --- Session store ----------------------------------------------------------

export interface CompletedWorkout {
  id: string;
  scenarioId: string;
  date: number;
  exerciseNames: string[];
  durationLabel: string;
}

interface SessionState {
  inputMode: InputMode;
  rawDescription: string;
  scenario: Scenario | null;
  // workout progress
  activeIndex: number;
  completedExercises: string[];
  history: CompletedWorkout[];
  streak: number;

  setInputMode: (m: InputMode) => void;
  setRawDescription: (s: string) => void;
  /** Run the mock interpretation against a chosen scenario or free text */
  interpret: (input: { scenarioId?: string; text?: string }) => void;
  setScenarioById: (id: string) => void;
  reset: () => void;

  // workout flow
  startWorkout: () => void;
  nextExercise: () => void;
  markExerciseDone: (id: string) => void;
  finishWorkout: () => void;
}

export const useSession = create<SessionState>((set, get) => ({
  inputMode: 'voice',
  rawDescription: '',
  scenario: null,
  activeIndex: 0,
  completedExercises: [],
  history: [],
  streak: 3,

  setInputMode: (m) => set({ inputMode: m }),
  setRawDescription: (s) => set({ rawDescription: s }),

  interpret: ({ scenarioId, text }) => {
    let scenario: Scenario;
    if (scenarioId) {
      scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
    } else {
      scenario = matchScenario(text ?? '');
    }
    set({
      scenario,
      rawDescription: text ?? scenario.spokenExample,
      activeIndex: 0,
      completedExercises: [],
    });
  },

  setScenarioById: (id) => {
    const scenario = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
    set({ scenario, activeIndex: 0, completedExercises: [] });
  },

  reset: () =>
    set({
      rawDescription: '',
      scenario: null,
      activeIndex: 0,
      completedExercises: [],
    }),

  startWorkout: () => set({ activeIndex: 0, completedExercises: [] }),

  nextExercise: () => {
    const { activeIndex, scenario } = get();
    if (!scenario) return;
    set({ activeIndex: Math.min(activeIndex + 1, scenario.exercises.length - 1) });
  },

  markExerciseDone: (id) => {
    const { completedExercises } = get();
    if (completedExercises.includes(id)) return;
    set({ completedExercises: [...completedExercises, id] });
  },

  finishWorkout: () => {
    const { scenario, history, streak } = get();
    if (!scenario) return;
    const entry: CompletedWorkout = {
      id: `${scenario.id}-${Date.now()}`,
      scenarioId: scenario.id,
      date: Date.now(),
      exerciseNames: scenario.exercises.map((e) => e.name),
      durationLabel: '~12 min',
    };
    set({ history: [entry, ...history], streak: streak + 1 });
  },
}));

export const SAMPLE_SCENARIOS = SCENARIOS;

// Voice prompt chips shown during context gathering
export const VOICE_PROMPTS = [
  'Just tell me where you are and what\u2019s around you.',
  'What are you wearing today \u2014 anything that limits how you move?',
  'Any conditions I should know about? Wet ground, busy street, limited space?',
];

// What the AI noticing-engine "thinks" through during the loading state
export const ANALYSIS_STEPS = [
  'Listening to what you described\u2026',
  'Reading your surroundings for usable surfaces\u2026',
  'Checking your clothing and how you can move\u2026',
  'Noting conditions \u2014 ground, space, privacy\u2026',
  'Matching movements to your exact moment\u2026',
];
