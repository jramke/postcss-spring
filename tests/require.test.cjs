const assert = require('node:assert/strict');
const test = require('node:test');
const plugin = require('../dist/index.cjs');

test('require', () => {
    plugin();
    assert.ok(plugin.postcss, 'plugin should have "postcss" flag');
    assert.equal(typeof plugin, 'function', 'plugin should return a function');
});
