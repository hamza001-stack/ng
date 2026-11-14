import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHtml } from '../src/lib/sanitize-html';

test('keeps safe markup', () => {
  assert.equal(sanitizeHtml('<h2 class="x">Hi</h2><p>a <strong>b</strong></p>'), '<h2 class="x">Hi</h2><p>a <strong>b</strong></p>');
});
test('drops script/style/iframe tags and escapes content', () => {
  const out = sanitizeHtml('<script>alert(1)</script><p>ok</p><iframe src="https://x"></iframe><style>a{}</style>');
  assert.ok(!/<script|<iframe|<style/i.test(out));
  assert.ok(out.includes('<p>ok</p>'));
});
test('strips event handlers and inline style', () => {
  const out = sanitizeHtml('<p onclick="x()" style="color:red">t</p><img src="/a.png" onerror="x()" alt="a">');
  assert.ok(!/onclick|onerror|style=/.test(out));
  assert.ok(out.includes('<img src="/a.png" alt="a" loading="lazy">'));
});
test('blocks javascript:, data: and obfuscated URLs', () => {
  for (const href of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' java\tscript:alert(1)', '&#106;avascript:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil.com']) {
    const out = sanitizeHtml(`<a href="${href}">x</a>`);
    assert.ok(!/href=/.test(out), href + ' -> ' + out);
  }
  assert.ok(sanitizeHtml('<a href="https://ok.com">x</a>').includes('href="https://ok.com"'));
  assert.ok(sanitizeHtml('<a href="/academy/courses">x</a>').includes('rel="noopener noreferrer"'));
});
test('img requires https or relative src', () => {
  assert.equal(sanitizeHtml('<img src="http://x/a.png">'), '');
  assert.equal(sanitizeHtml('<img src="javascript:x">'), '');
});
test('malformed tags are escaped, unclosed tags are closed', () => {
  assert.equal(sanitizeHtml('<div><p>x'), '<div><p>x</p></div>');
  assert.equal(sanitizeHtml('1 < 2 and <b'), '1 &lt; 2 and &lt;b');
  assert.ok(!sanitizeHtml('<p <script>alert(1)</script>').includes('<script'));
});
test('comments removed', () => {
  assert.equal(sanitizeHtml('a<!-- <script>x</script> -->b'), 'ab');
});
test('attribute-breakout attempts', () => {
  const out = sanitizeHtml('<a href="https://x.com&quot; onmouseover=&quot;alert(1)">x</a>');
  assert.ok(!/ onmouseover=/.test(out), out);
  assert.equal((out.match(/"/g) || []).length, 4, out);
  const out2 = sanitizeHtml('<a title=\'"><script>alert(1)</script>\' href="/x">y</a>');
  assert.ok(!out2.includes('<script'), out2);
});
