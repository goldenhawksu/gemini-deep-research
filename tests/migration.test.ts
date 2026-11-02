import test from 'node:test';
import assert from 'node:assert/strict';
test('legacy untouched defaults migrate, customized providers stay unchanged', async () => {
  const { migrateSettings } = await import('../src/store/setting');
  const migrated = migrateSettings({ provider: 'google', mode: '', thinkingModel: 'gemini-2.5-flash', networkingModel: 'gemini-2.5-flash', searchProvider: 'model', apiKey: '' });
  assert.equal(migrated.provider, 'openaicompatible');
  assert.equal(migrated.mode, 'proxy');
  assert.equal(migrated.searchProvider, 'searxng');
  const custom = { provider: 'openai', mode: 'local', openAIThinkingModel: 'custom' };
  assert.deepEqual(migrateSettings(custom), custom);
});
