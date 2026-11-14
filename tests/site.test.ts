import test from 'node:test';
import assert from 'node:assert/strict';
import { publicSiteUrl } from '../src/lib/site';
import { money } from '../src/lib/utils';

test('public site url never uses the preview chatgpt host', () => {
  assert.equal(publicSiteUrl().includes('chatgpt.site'), false);
});

test('money formats GBP', () => {
  assert.match(money(12), /£12/);
});
