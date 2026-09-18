'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parseLinks, validate } = require('./validate-list');

const README_PATH = path.join(__dirname, '..', 'README.md');

test('README.md passes list validation with zero violations', () => {
  const markdown = fs.readFileSync(README_PATH, 'utf8');
  const errors = validate(markdown, 'README.md');
  assert.deepEqual(errors, [], 'README.md should have no list violations');
});

test('README.md contains at least one link', () => {
  const markdown = fs.readFileSync(README_PATH, 'utf8');
  const links = parseLinks(markdown);
  assert.ok(links.length > 0, 'README.md should contain links');
});

test('duplicate URLs in the same section are reported', () => {
  const markdown = [
    '## Section A',
    '- [Foo](https://example.com/a)',
    '- [Bar](https://example.com/a)',
  ].join('\n');
  const errors = validate(markdown, 'fixture.md');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /duplicate URL "https:\/\/example\.com\/a"/);
});

test('the same URL in different sections is allowed (cross-reference)', () => {
  const markdown = [
    '## Section A',
    '- [Foo](https://example.com/a)',
    '## Section B',
    '- [Foo again](https://example.com/a)',
  ].join('\n');
  const errors = validate(markdown, 'fixture.md');
  assert.deepEqual(errors, []);
});

test('category labels without links are allowed', () => {
  const markdown = [
    '## Tools',
    '- Generators',
    '  - [generator-cordova](https://example.com/generator)',
  ].join('\n');
  const errors = validate(markdown, 'fixture.md');
  assert.deepEqual(errors, []);
});

test('list items without a markdown link are reported', () => {
  const markdown = '- Not a link\n- [Ok](https://example.com/ok)\n';
  const errors = validate(markdown, 'fixture.md');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /missing a valid markdown link/);
});

test('links with empty text or URL are reported', () => {
  const markdown = '- [](https://example.com/empty-text)\n- [No URL]()\n';
  const errors = validate(markdown, 'fixture.md');
  assert.equal(errors.length, 2);
});

test('parseLinks extracts text and url pairs', () => {
  const markdown = '- [Ionic](http://ionicframework.com/)\n';
  const links = parseLinks(markdown);
  assert.equal(links.length, 1);
  assert.equal(links[0].text, 'Ionic');
  assert.equal(links[0].url, 'http://ionicframework.com/');
});