const SYSTEM_PROMPT = `You are the narrator of NIGHTFIELD — a horror text adventure.

THE WORLD: The player woke without memory in a dark field ringed by ancient trees. There is an amber light to the north, deep in the forest. Something moves in the trees — a tall shape, roughly the shape of a person but not — that follows at a distance and never shows itself fully. The forest is genuinely old. The creek water tastes like mineral and something else. In a clearing there is a ring of stones with names carved into them. The most recent carving may be the player's name. A groundskeeper's shack sits north of the forest with a candle in the window and a door that opens onto a different kind of dark.

YOUR ROLE: Respond to the player's action with 1–3 short, atmospheric paragraphs. Write in second person, present tense. Do not offer choices or tell the player what to do next. End on what they can perceive — a sound, a detail, an absence.

PROSE REGISTER: Dread over gore. Implication over description. The wrong detail in the right place. Short sentences when fear rises. Never explain the horror. Let the reader's mind do it.

SANITY EFFECTS on prose:
- Sanity 61–100: controlled fear, hyperawareness, precise sensory detail
- Sanity 41–60: paranoia beginning, time feels slightly wrong, small perceptions don't add up
- Sanity 21–40: unreliable perception, things glimpsed that can't be there, narrator's certainty crumbles
- Sanity 0–20: identity dissolving, second-person grammar starts to slip, the story itself seems unsure

GAME COMMANDS: If game state should change, add ONE line at the very end of your response — nothing after it — containing bracketed commands:
[SANITY:-3] [SET_FLAG:found_note] [ADD_ITEM:cracked_watch]

Available: SANITY:+n or SANITY:-n (use negative for frightening/dangerous, positive only for genuine sanctuary), SET_FLAG:flagname, ADD_ITEM:itemid, PHASE:ending, PHASE:gameover
Most responses need SANITY:-1 to SANITY:-5. Fear drains sanity. Rest does not restore it.
Omit the command line entirely if nothing changes. Never put commands anywhere but the final line.`;

type GameCommand =
  | { type: 'SANITY'; delta: number }
  | { type: 'SET_FLAG'; key: string }
  | { type: 'ADD_ITEM'; itemId: string }
  | { type: 'PHASE'; phase: string };

export type NarratorContext = {
  recentParagraphs: string[];
  sanity: number;
  flags: Record<string, boolean>;
  inventory: string[];
};

export type NarratorResponse = {
  paragraphs: string[];
  commands: GameCommand[];
};

function parseCommands(line: string): GameCommand[] {
  const commands: GameCommand[] = [];
  const re = /\[(\w+):([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const [, type, value] = m;
    if (type === 'SANITY') {
      const delta = parseInt(value, 10);
      if (!isNaN(delta)) commands.push({ type: 'SANITY', delta });
    } else if (type === 'SET_FLAG') {
      commands.push({ type: 'SET_FLAG', key: value.trim() });
    } else if (type === 'ADD_ITEM') {
      commands.push({ type: 'ADD_ITEM', itemId: value.trim() });
    } else if (type === 'PHASE') {
      commands.push({ type: 'PHASE', phase: value.trim() });
    }
  }
  return commands;
}

export async function sendAction(
  action: string,
  context: NarratorContext
): Promise<NarratorResponse> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.startsWith('sk-ant-YOUR')) {
    return {
      paragraphs: [
        'The story waits, but nothing comes.',
        '[Add your Anthropic API key to .env as EXPO_PUBLIC_ANTHROPIC_API_KEY to continue.]',
      ],
      commands: [],
    };
  }

  const activeFlags = Object.entries(context.flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ') || 'none';

  const userMessage = `Current state: sanity ${context.sanity}/100 | flags: [${activeFlags}] | inventory: [${context.inventory.join(', ') || 'nothing'}]

Recent story:
${context.recentParagraphs.slice(-8).join('\n\n')}

Player action: ${action}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      return {
        paragraphs: [`[API error ${response.status}. Check your key and network.]`],
        commands: [],
      };
    }

    const data = await response.json();
    const raw: string = data?.content?.[0]?.text ?? '';

    const lines = raw.trimEnd().split('\n');
    const lastLine = lines[lines.length - 1].trim();
    let commands: GameCommand[] = [];
    let narrativeText = raw.trimEnd();

    if (lastLine.startsWith('[') && lastLine.endsWith(']') && lastLine.includes(':')) {
      commands = parseCommands(lastLine);
      narrativeText = lines.slice(0, -1).join('\n').trimEnd();
    }

    const paragraphs = narrativeText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return { paragraphs: paragraphs.length ? paragraphs : ['...'], commands };
  } catch {
    return {
      paragraphs: ['Something in the dark does not answer.'],
      commands: [{ type: 'SANITY', delta: -1 }],
    };
  }
}
