import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
process.env.ACCESS_PASSWORD = 'test-only-password';
process.env.OPENAI_COMPATIBLE_API_KEY = 'test-only-key';
test('cookie authorizes AI, search, crawler, SSE, MCP without browser password and preserves legacy signatures', async () => {
  const { middleware } = await import('../src/middleware');
  const { createSession } = await import('../src/utils/session');
  const { generateSignature } = await import('../src/utils/signature');
  const cookie = `research_session=${await createSession('test-only-password')}`;
  for (const path of ['/api/ai/openaicompatible/v1/chat/completions', '/api/search/searxng/search', '/api/crawler', '/api/sse', '/api/mcp', '/']) {
    const response = await middleware(new NextRequest(`http://localhost${path}`, { method: path === '/' ? 'GET' : 'POST', headers: { cookie, 'content-type': 'application/json' }, body: path === '/' ? undefined : JSON.stringify({ model: 'gpt-6.1-terra' }) }));
    assert.equal(response.status, 200, path);
  }
  const legacy = await middleware(new NextRequest('http://localhost/api/search/searxng/search', { method: 'POST', headers: { authorization: `Bearer ${generateSignature('test-only-password', Date.now())}` } }));
  assert.equal(legacy.status, 200);
  for (const path of ['/api/crawler', '/api/sse', '/api/mcp', '/api/search/searxng/search']) {
    assert.ok((await middleware(new NextRequest(`http://localhost${path}`, { method: 'POST' }))).status >= 400);
  }
});
test('client search and AI requests retain same-origin session credentials', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile('src/utils/deep-research/search.ts', 'utf8');
  assert.ok(!source.includes('credentials: "omit"'));
  const provider = await readFile('src/utils/deep-research/provider.ts', 'utf8');
  assert.ok(!provider.includes('credentials: "omit"'));
});
