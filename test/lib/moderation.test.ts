import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isImageFlagged, isTextFlagged } from '@/lib/moderation';

interface ModerationRequestBody {
  input: Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

function mockFetchOnce(response: { ok: boolean; status?: number; body?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: () => response.body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function getRequestBody(fetchMock: ReturnType<typeof vi.fn>): ModerationRequestBody {
  const [, options] = fetchMock.mock.calls[0] as [string, { body: string }];
  return JSON.parse(options.body) as ModerationRequestBody;
}

describe('isTextFlagged', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('fails open (false) when OPENAI_API_KEY is unset, without calling the API', async () => {
    vi.unstubAllEnvs();
    const fetchMock = mockFetchOnce({ ok: true, body: { results: [{ flagged: true }] } });
    expect(await isTextFlagged('anything')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns true when the API reports the content as flagged', async () => {
    mockFetchOnce({ ok: true, body: { results: [{ flagged: true }] } });
    expect(await isTextFlagged('some text')).toBe(true);
  });

  it('returns false when the API reports the content as clean', async () => {
    mockFetchOnce({ ok: true, body: { results: [{ flagged: false }] } });
    expect(await isTextFlagged('some text')).toBe(false);
  });

  it('fails open (false) when the API responds with a non-ok status', async () => {
    mockFetchOnce({ ok: false, status: 429 });
    expect(await isTextFlagged('some text')).toBe(false);
  });

  it('fails open (false) when the fetch call throws (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    expect(await isTextFlagged('some text')).toBe(false);
  });

  it('sends the text as a single input item to the moderation endpoint', async () => {
    const fetchMock = mockFetchOnce({ ok: true, body: { results: [{ flagged: false }] } });
    await isTextFlagged('hello world');
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('https://api.openai.com/v1/moderations');
    expect(getRequestBody(fetchMock).input).toEqual([{ type: 'text', text: 'hello world' }]);
  });
});

describe('isImageFlagged', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the file as a base64 data URI image_url input', async () => {
    const fetchMock = mockFetchOnce({ ok: true, body: { results: [{ flagged: false }] } });
    const file = new File([new Uint8Array([1, 2, 3])], 'test.png', { type: 'image/png' });

    await isImageFlagged(file);

    const { input } = getRequestBody(fetchMock);
    expect(input).toHaveLength(1);
    expect(input[0].type).toBe('image_url');
    expect(input[0].image_url?.url).toMatch(/^data:image\/png;base64,/);
  });
});
