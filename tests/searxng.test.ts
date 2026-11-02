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
test('SearXNG succeeds with the redirect modes supported by Vercel Edge', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, init) => {
    if (init?.redirect !== 'follow' && init?.redirect !== 'manual') {
      throw new TypeError('Invalid redirect value must be follow or manual');
    }
    assert.equal(init.redirect, 'manual');
    return Response.json({ results: [{ title: 'Cloudflare' }] });
  };
  try {
    const response = await POST(new NextRequest('http://localhost/api/search/searxng/search?q=Cloudflare&format=json', { method: 'POST' }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { results: [{ title: 'Cloudflare' }] });
  } finally { global.fetch = originalFetch; }
});
test('SearXNG rejects redirects without following or exposing their destination', async () => {
  const { fetchSearxng } = await import('../src/utils/searxng');
  const originalFetch = global.fetch;
  try {
    for (const status of [301, 302, 303, 307, 308]) {
      let calls = 0;
      let canceled = false;
      global.fetch = async (_url, init) => {
        calls++;
        assert.equal(init?.redirect, 'manual');
        return new Response(new ReadableStream({ cancel() { canceled = true; } }), {
          status, headers: { Location: 'https://other.example/private?token=secret' },
        });
      };
      await assert.rejects(fetchSearxng('https://searxng.aesc.ai/search?q=test'), {
        message: 'Search upstream redirect rejected',
      });
      assert.equal(calls, 1);
      assert.equal(canceled, true);
    }
    const response = await POST(new NextRequest('http://localhost/api/search/searxng/search?q=test', { method: 'POST' }));
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'Search upstream unavailable' });
    assert.equal(response.headers.get('Location'), null);
  } finally { global.fetch = originalFetch; }
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
