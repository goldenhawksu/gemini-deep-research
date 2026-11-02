import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/search/searxng/[...slug]/route';
test('SearXNG uses fixed server origin, browser headers, GET JSON and three 429 attempts', async () => {
  const originalFetch = global.fetch;
  const originalTimeout = global.setTimeout;
  const waits: number[] = [];
  const calls: { url: string; init?: RequestInit }[] = [];
  global.setTimeout = ((callback: () => void, ms: number) => { waits.push(ms); callback(); return 0; }) as unknown as typeof setTimeout;
  global.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response(JSON.stringify({ results: [] }), { status: calls.length < 3 ? 429 : 200 }); };
  try {
    const response = await POST(new NextRequest('http://localhost/api/search/searxng/search?q=test&format=json', { method: 'POST', headers: { 'x-proxy-url': 'http://127.0.0.1/private' } }));
    assert.equal(response?.status, 200);
    assert.equal(calls.length, 3);
    assert.equal(new URL(calls[0].url).origin, 'https://searxng.aesc.ai');
    assert.equal(new URL(calls[0].url).pathname, '/search');
    assert.equal(calls[0].init?.method, 'GET');
    const headers = new Headers(calls[0].init?.headers);
    assert.match(headers.get('User-Agent')!, /Mozilla/);
    assert.equal(headers.get('Accept'), 'application/json,text/html');
    assert.equal(headers.get('Accept-Language'), 'en-US,en;q=0.9');
    assert.equal(headers.get('Sec-Fetch-Dest'), 'empty');
    assert.equal(headers.get('Sec-Fetch-Mode'), 'cors');
    assert.equal(headers.get('Sec-Fetch-Site'), 'same-origin');
    assert.deepEqual(waits, [3000, 5000]);
  } finally { global.fetch = originalFetch; global.setTimeout = originalTimeout; }
});
test('server-side SearXNG searches use the same headers', async () => {
  const { createSearchProvider } = await import('../src/utils/deep-research/search');
  const originalFetch = global.fetch;
  let sent: RequestInit | undefined;
  global.fetch = async (_url, init) => { sent = init; return Response.json({ results: [] }); };
  try {
    await createSearchProvider({ provider: 'searxng', baseURL: 'https://searxng.aesc.ai', query: 'test' });
    assert.equal(new Headers(sent?.headers).get('Sec-Fetch-Mode'), 'cors');
  } finally { global.fetch = originalFetch; }
});
