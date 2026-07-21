'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { hello } = require('../index.js');

test('greets the world by default', () => {
  assert.equal(hello(), 'Hello, world!');
});

test('greets a named person', () => {
  assert.equal(hello('Ada'), 'Hello, Ada!');
});

test('trims surrounding whitespace', () => {
  assert.equal(hello('  Grace  '), 'Hello, Grace!');
});

test('falls back to the world for blank input', () => {
  assert.equal(hello('   '), 'Hello, world!');
  assert.equal(hello(''), 'Hello, world!');
});
