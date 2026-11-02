import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('reset persists site defaults and preserves unrelated research/history storage', async () => {
  const data = new Map<string, string>([['history', 'keep history'], ['research', 'keep research']]);
  const localStorage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } };
  Object.assign(globalThis, { localStorage, window: { localStorage } });
  const { defaultValues, useSettingStore } = await import('../src/store/setting');
  useSettingStore.getState().update({ provider: 'google', mode: 'local', apiKey: 'user-custom-key', openAICompatibleThinkingModel: 'custom', searchProvider: 'tavily' });
  useSettingStore.getState().reset();
  const saved = JSON.parse(data.get('setting')!).state;
  for (const [key, value] of Object.entries(defaultValues)) assert.equal(saved[key], value, key);
  assert.equal(data.get('history'), 'keep history');
  assert.equal(data.get('research'), 'keep research');
});

test('visible reset confirms, updates form and store, preserves history and cancel is a no-op', async () => {
  const source = readFileSync('src/components/Setting.tsx', 'utf8');
  assert.equal(source.includes('onClick={handleReset}'), true, 'visible reset control');
  const handler = source.slice(source.indexOf('function handleReset()'), source.indexOf('useLayoutEffect', source.indexOf('function handleReset()')));
  const { defaultValues, useSettingStore } = await import('../src/store/setting');
  let accepted = false;
  let formValues: unknown = 'custom';
  const handleReset = new Function('window', 't', 'useSettingStore', 'defaultValues', 'form', 'fetchModelList', `${handler}; return handleReset;`)(
    { confirm: () => accepted }, (key: string) => key, useSettingStore, defaultValues,
    { reset: (values: unknown) => { formValues = values; } }, async () => [],
  );
  useSettingStore.getState().update({ provider: 'google', mode: 'local', searchProvider: 'tavily' });
  handleReset();
  assert.equal(useSettingStore.getState().provider, 'google');
  assert.equal(formValues, 'custom');
  accepted = true;
  handleReset();
  assert.deepEqual(formValues, defaultValues);
  assert.equal(useSettingStore.getState().provider, 'openaicompatible');
  assert.equal(useSettingStore.getState().mode, 'proxy');
  assert.equal(useSettingStore.getState().searchProvider, 'searxng');
  assert.equal(source.includes('researchStore.clear()'), false);
  assert.equal(source.includes('defaultValue={field.value}'), false, 'selects must respond to form.reset');
});
