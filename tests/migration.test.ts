import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => { storage.set(key, value); },
  removeItem: (key) => { storage.delete(key); },
  clear: () => { storage.clear(); },
  key: (index) => [...storage.keys()][index] ?? null,
  get length() { return storage.size; },
};
Object.defineProperty(globalThis, 'window', { value: { localStorage: globalThis.localStorage }, configurable: true });

test('legacy untouched defaults migrate, customized providers stay unchanged', async () => {
  const { migrateSettings } = await import('../src/store/setting');
  const migrated = migrateSettings({ provider: 'google', mode: '', thinkingModel: 'gemini-2.5-flash', networkingModel: 'gemini-2.5-flash', searchProvider: 'model', apiKey: '' });
  assert.equal(migrated.provider, 'openaicompatible');
  assert.equal(migrated.mode, 'proxy');
  assert.equal(migrated.searchProvider, 'searxng');
  assert.equal(migrated.openAICompatibleThinkingModel, 'gpt-6.1-sol');
  assert.equal(migrated.openAICompatibleNetworkingModel, 'gpt-6.1-sol');
  const custom = { provider: 'openai', mode: 'local', openAIThinkingModel: 'custom' };
  assert.deepEqual(migrateSettings(custom), custom);
});

test('proxy OpenAI-compatible legacy default models migrate independently', async () => {
  const { migrateSettings } = await import('../src/store/setting');
  const saved = {
    provider: 'openaicompatible', mode: 'proxy',
    openAICompatibleThinkingModel: 'gpt-6.1-terra',
    openAICompatibleNetworkingModel: 'my-custom-networking-model',
    searchProvider: 'tavily',
  };
  assert.deepEqual(migrateSettings(saved), { ...saved, openAICompatibleThinkingModel: 'gpt-6.1-sol' });
  assert.equal(saved.openAICompatibleThinkingModel, 'gpt-6.1-terra');
  const networking = { ...saved, openAICompatibleThinkingModel: 'my-custom-thinking-model', openAICompatibleNetworkingModel: 'gpt-6.1-terra' };
  assert.deepEqual(migrateSettings(networking), { ...networking, openAICompatibleNetworkingModel: 'gpt-6.1-sol' });
  const both = { ...saved, openAICompatibleNetworkingModel: 'gpt-6.1-terra' };
  assert.deepEqual(migrateSettings(both), { ...both, openAICompatibleThinkingModel: 'gpt-6.1-sol', openAICompatibleNetworkingModel: 'gpt-6.1-sol' });
});

test('persisted version 2 defaults hydrate to sol and save as version 3', async () => {
  const { useSettingStore } = await import('../src/store/setting');
  storage.set('setting', JSON.stringify({ version: 2, state: {
    provider: 'openaicompatible', mode: 'proxy',
    openAICompatibleThinkingModel: 'gpt-6.1-terra',
    openAICompatibleNetworkingModel: 'gpt-6.1-terra',
  } }));
  await useSettingStore.persist.rehydrate();
  assert.equal(useSettingStore.getState().openAICompatibleThinkingModel, 'gpt-6.1-sol');
  assert.equal(useSettingStore.getState().openAICompatibleNetworkingModel, 'gpt-6.1-sol');
  assert.equal(JSON.parse(storage.get('setting')!).version, 3);
});

test('persisted version 0 and 1 Google defaults retain the original migration', async () => {
  const { useSettingStore } = await import('../src/store/setting');
  for (const version of [0, 1]) {
    storage.set('setting', JSON.stringify({ version, state: {
      provider: 'google', mode: '', apiKey: '',
      thinkingModel: 'gemini-2.5-flash', networkingModel: 'gemini-2.5-flash', searchProvider: 'model',
    } }));
    await useSettingStore.persist.rehydrate();
    const migrated = useSettingStore.getState();
    assert.equal(migrated.provider, 'openaicompatible');
    assert.equal(migrated.mode, 'proxy');
    assert.equal(migrated.searchProvider, 'searxng');
    assert.equal(migrated.openAICompatibleThinkingModel, 'gpt-6.1-sol');
    assert.equal(migrated.openAICompatibleNetworkingModel, 'gpt-6.1-sol');
    assert.equal(JSON.parse(storage.get('setting')!).version, 3);
  }
});

test('mode inference still preserves credentialed local models', async () => {
  const { migrateSettings } = await import('../src/store/setting');
  const saved = {
    provider: 'openaicompatible', mode: '', openAICompatibleApiKey: 'user-key',
    openAICompatibleThinkingModel: 'gpt-6.1-terra', openAICompatibleNetworkingModel: 'gpt-6.1-terra',
  };
  assert.deepEqual(migrateSettings(saved), { ...saved, mode: 'local' });
  const proxy = { ...saved, openAICompatibleApiKey: '' };
  assert.deepEqual(migrateSettings(proxy), { ...proxy, mode: 'proxy', openAICompatibleThinkingModel: 'gpt-6.1-sol', openAICompatibleNetworkingModel: 'gpt-6.1-sol' });
});

test('custom models, local mode and other providers keep their model selections', async () => {
  const { migrateSettings } = await import('../src/store/setting');
  const models = { openAICompatibleThinkingModel: 'gpt-6.1-terra', openAICompatibleNetworkingModel: 'gpt-6.1-terra' };
  for (const saved of [
    { ...models, provider: 'openaicompatible', mode: 'local' },
    { ...models, provider: 'openai', mode: 'proxy' },
    { provider: 'openaicompatible', mode: 'proxy', openAICompatibleThinkingModel: 'custom-thinking', openAICompatibleNetworkingModel: 'custom-networking' },
  ]) {
    assert.deepEqual(migrateSettings(saved), saved);
  }
});
