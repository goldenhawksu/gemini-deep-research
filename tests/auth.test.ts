import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
process.env.ACCESS_PASSWORD = 'test-only-password';
process.env.OPENAI_COMPATIBLE_API_KEY = 'test-only-key';
test('pages redirect to login and unknown APIs reject anonymous callers', async () => {
  const { middleware } = await import('../src/middleware');
  const page = await middleware(new NextRequest('http://localhost/'));
  assert.equal(page.status, 307);
  assert.equal(new URL(page.headers.get('location')!).pathname, '/login');
  const api = await middleware(new NextRequest('http://localhost/api/unknown'));
  assert.equal(api.status, 401);
});
