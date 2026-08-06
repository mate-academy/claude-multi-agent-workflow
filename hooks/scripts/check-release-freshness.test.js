const test = require('node:test');
const assert = require('node:assert/strict');
const { isGitPush, hasUnreleasedContent } = require('./check-release-freshness.js');

test('isGitPush matches a plain git push', () => {
  assert.equal(isGitPush('git push'), true);
});

test('isGitPush matches git push with args', () => {
  assert.equal(isGitPush('git push origin main'), true);
});

test('isGitPush matches git push chained after another command', () => {
  assert.equal(isGitPush('npm test && git push'), true);
});

test('isGitPush does not match unrelated git commands', () => {
  assert.equal(isGitPush('git status'), false);
});

test('isGitPush does not match non-string input', () => {
  assert.equal(isGitPush(undefined), false);
});

test('isGitPush does not match a commit message that mentions "git push"', () => {
  assert.equal(isGitPush('git commit -m "remember to git push after this"'), false);
});

test('isGitPush matches git push with a -C flag before it', () => {
  assert.equal(isGitPush('git -C /some/path push origin main'), true);
});

test('isGitPush matches git push with --no-pager before it', () => {
  assert.equal(isGitPush('git --no-pager push'), true);
});

test('isGitPush still matches git push chained after another command', () => {
  assert.equal(isGitPush('npm test && git push'), true);
});

test('hasUnreleasedContent is false for an empty Unreleased section', () => {
  const text = '# Changelog\n\n## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n- Initial release\n';
  assert.equal(hasUnreleasedContent(text), false);
});

test('hasUnreleasedContent is true when Unreleased has bullets', () => {
  const text = '# Changelog\n\n## [Unreleased]\n- Added a thing\n\n## [1.0.0] - 2026-01-01\n';
  assert.equal(hasUnreleasedContent(text), true);
});

test('hasUnreleasedContent is false when there is no Unreleased heading', () => {
  const text = '# Changelog\n\n## [1.0.0] - 2026-01-01\n- Initial release\n';
  assert.equal(hasUnreleasedContent(text), false);
});
