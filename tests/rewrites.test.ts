import test from 'node:test';
import assert from 'node:assert/strict';
test('SearXNG cannot bypass header/retry route through external rewrite', async () => {
  const { default: config } = await import('../next.config');
  const result = await config('phase-development-server');
  const rewrites = await result.rewrites!();
  assert.ok(Array.isArray(rewrites));
  assert.ok(!rewrites.some(rule => rule.source.includes('/api/search/searxng')));
});
