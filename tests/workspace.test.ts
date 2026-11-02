import test from 'node:test';
import assert from 'node:assert/strict';
import { getResearchStage } from '../src/utils/research-stage';
test('workspace progress reflects existing research state without advancing it', () => {
  assert.equal(getResearchStage({ questions: '', reportPlan: '', tasks: [], finalReport: '' }), 0);
  assert.equal(getResearchStage({ questions: 'Clarify', reportPlan: '', tasks: [], finalReport: '' }), 1);
  assert.equal(getResearchStage({ questions: 'Clarify', reportPlan: 'Plan', tasks: [], finalReport: '' }), 1);
  assert.equal(getResearchStage({ questions: 'Clarify', reportPlan: 'Plan', tasks: [{ state: 'processing' }], finalReport: '' }), 2);
  assert.equal(getResearchStage({ questions: 'Clarify', reportPlan: 'Plan', tasks: [{ state: 'completed' }], finalReport: '' }), 3);
  assert.equal(getResearchStage({ questions: '', reportPlan: '', tasks: [], finalReport: 'Restored report' }), 3);
});
