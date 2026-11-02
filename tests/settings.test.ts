import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultValues } from '../src/store/setting';
test('fresh settings default to server sub2api models and SearXNG', () => {
  assert.equal(defaultValues.provider, 'openaicompatible');
  assert.equal(defaultValues.mode, 'proxy');
  assert.equal(defaultValues.openAICompatibleThinkingModel, 'gpt-6.1-terra');
  assert.equal(defaultValues.openAICompatibleNetworkingModel, 'gpt-6.1-terra');
  assert.equal(defaultValues.searchProvider, 'searxng');
  assert.equal(defaultValues.accessPassword, '');
});
