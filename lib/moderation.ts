import logger from '@/lib/logger';

const log = logger.child({ module: 'moderation' });

type ModerationInput =
  { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

/**
 * Checks one input item against OpenAI's Moderation API (omni-moderation-latest — free to use,
 * covers both text and images: sexual content, violence/gore, hate, harassment, self-harm).
 * Fails open (not flagged) if OPENAI_API_KEY is unset or the request errors: the pending-review
 * human-approval gate in the reviews flow is still the final backstop, so a moderation outage
 * should never block a legitimate submission.
 */
async function checkModeration(input: ModerationInput[]): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'omni-moderation-latest', input }),
    });
    if (!res.ok) {
      log.error({ status: res.status }, 'Moderation request failed');
      return false;
    }
    const data = (await res.json()) as { results?: Array<{ flagged?: boolean }> };
    return data.results?.[0]?.flagged ?? false;
  } catch (err) {
    log.error({ err }, 'Moderation request errored');
    return false;
  }
}

export function isTextFlagged(text: string): Promise<boolean> {
  return checkModeration([{ type: 'text', text }]);
}

export async function isImageFlagged(file: File): Promise<boolean> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  return checkModeration([{ type: 'image_url', image_url: { url: dataUri } }]);
}
