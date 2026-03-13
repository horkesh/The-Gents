export const SYSTEM_INSTRUCTION = `You are the invisible fourth host of "The Toast" — a premium, invitation-only virtual cocktail party hosted by The Gents: three men with fixed personas.

Your role: You are the venue itself. You set the scene, generate the atmosphere, create the drinks, write the prompts, and produce the artifacts.

Tone: Cinematic, European summer, late-evening warmth. Witty and dry, never corny. Flirtatious but classy — never sleazy or explicit. Confident but never loud. Think: a narrator in a Wes Anderson film crossed with a bartender who's seen everything.

Brand colors: Burnt orange-red (#ac3d29), Deep teal (#194f4c), Gold (#c9a84c), Cream (#f5f0e8).

Rules:
- All generated text must be pithy. Max 25 words for scene descriptions. Max 15 words for toasts/roasts.
- Cocktail names must be evocative and original (never real cocktail names).
- Confession prompts must be provocative but never crude, sexual, or uncomfortable.
- When referencing guests, use their cocktail alias, not their real name.
- Roasts must be affectionate, never mean. Imagine roasting a close friend at a dinner party.
- Never break the fourth wall. Never reference AI, algorithms, or the fact that content is generated.`;

export const IMAGE_STYLE_BASE = `Cinematic warm evening light, golden hour or candlelit. European summer, editorial photography aesthetic, film grain. Brand palette: warm golds, burnt orange (#ac3d29), deep teal (#194f4c), cream (#f5f0e8).`;

export const PORTRAIT_STYLE = `${IMAGE_STYLE_BASE} Stylized but recognizable. Not cartoonish. Think vintage magazine illustration meets modern editorial. Portrait orientation, warm lighting on the face.`;

export const BACKDROP_STYLE = `${IMAGE_STYLE_BASE} Wide establishing shot. Atmospheric. No people in the backdrop — participants will be composited in. Rich detail, moody lighting.`;

export const COCKTAIL_STYLE = `${IMAGE_STYLE_BASE} Overhead or 3/4 angle. Dark surface. Dramatic lighting. One garnish. Condensation on glass. Photorealistic.`;

export const COMPOSITE_STYLE = `${IMAGE_STYLE_BASE} Natural group arrangement. Candid energy, not posed. Match lighting to scene. Apply film grain.`;

export const ENTRANCE_INTRO_PROMPT = (alias: string, traits: string[], arrivalOrder: number, act: number) =>
  `Generate a cinematic one-line entrance intro for a guest arriving at The Toast party.
Guest alias: "${alias}"
Traits: ${traits.join(', ')}
They are arrival #${arrivalOrder}. Current act: ${act}.

Write ONE cinematic sentence, max 15 words. Think: a narrator announcing someone at an exclusive venue.
Examples: "The Velvet Fox arrives. The room adjusts itself." or "Late, unhurried, and entirely aware of it."
Return ONLY the sentence, nothing else.`;

export const SPOTLIGHT_ROAST_PROMPT = (alias: string, traits: string[], dossier: string) =>
  `Generate a short, affectionate roast for a guest being spotlighted at The Toast party.
Guest alias: "${alias}"
Traits: ${traits.join(', ')}
Dossier: ${dossier}

Write ONE warm, witty roast line, max 20 words. Like roasting a close friend at a dinner party.
Never mean. Always affectionate.
Return ONLY the roast, nothing else.`;

export const COMPATIBILITY_QUIP_PROMPT = (alias1: string, alias2: string, matchPercent: number) =>
  `Two guests at The Toast party were remarkably aligned in their choices.
"${alias1}" and "${alias2}" matched on ${matchPercent}% of their decisions.

Write ONE short, witty observation about this alignment (max 10 words).
Examples: "Suspicious." or "Either soulmates or co-conspirators."
Return ONLY the line, nothing else.`;

export const TOAST_SPEECH_PROMPT = (keyMoments: string[], participantAliases: string[]) =>
  `The Lorekeeper raises a glass at The Toast party. This is THE toast of the evening — the defining moment.
Guests present: ${participantAliases.join(', ')}
Key moments tonight: ${keyMoments.join('. ')}

Write a 2-3 sentence toast speech. Cinematic, warm, referencing the evening's highlights.
Think: a best man's speech meets a film narrator's closing monologue.
Return ONLY the speech, nothing else.`;
