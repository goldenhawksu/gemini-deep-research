import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';


test('model refresh after defaults reset reads current proxy mode, not previous local mode', async () => {
  const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  Object.assign(globalThis, { window: { localStorage }, localStorage });
  const { defaultValues, useSettingStore } = await import('../src/store/setting');
  const { default: useModelList } = await import('../src/hooks/useModelList');
  useSettingStore.getState().update({ mode: 'local', provider: 'google' });
  let models: ReturnType<typeof useModelList>;
  function Probe() { models = useModelList(); return null; }
  renderToString(createElement(Probe));
  useSettingStore.getState().reset();
  const calls: string[] = [];
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url) => { calls.push(String(url)); return Response.json({ data: [{ id: 'gpt-6.1-terra' }] }); };
  try {
    assert.deepEqual(await models!.refresh(defaultValues.provider), ['gpt-6.1-terra']);
    assert.deepEqual(calls, ['/api/ai/openaicompatible/v1/models']);
  } finally { globalThis.fetch = oldFetch; }
});

test('blank-mode settings use server proxy without storing password; explicit local config stays local', async () => {
  const { resolveRequestMode, defaultValues } = await import('../src/store/setting');
  assert.equal(typeof resolveRequestMode, 'function');
  assert.equal(resolveRequestMode({ ...defaultValues, mode: '' }), 'proxy');
  assert.equal(resolveRequestMode({ ...defaultValues, mode: '', openAICompatibleApiKey: 'custom' }), 'local');
  assert.equal(resolveRequestMode({ ...defaultValues, mode: '', apiKey: 'inactive-google-key' }), 'proxy');
  assert.equal(resolveRequestMode({ ...defaultValues, provider: 'google-vertex', mode: '', googlePrivateKey: 'custom' }), 'local');
  assert.equal(resolveRequestMode({ ...defaultValues, provider: 'google-vertex', mode: '', googleVertexProject: 'custom-project' }), 'local');
  assert.equal(resolveRequestMode({ ...defaultValues, mode: 'local' }), 'local');
  const { migrateSettings } = await import('../src/store/setting');
  assert.equal(migrateSettings({ ...defaultValues, mode: '' }).mode, 'proxy');
  assert.equal(migrateSettings({ ...defaultValues, mode: '', openAICompatibleApiKey: 'custom' }).mode, 'local');
  const source = readFileSync('src/components/Setting.tsx', 'utf8');
  assert.equal(source.includes('!apiKey && accessPassword'), false);
  assert.equal(source.includes('name="accessPassword"'), false, 'login cookie replaces browser password settings');
  assert.equal(source.includes('resolveRequestMode(values)'), true);
});
