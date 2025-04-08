import assert from 'node:assert/strict';
import test from 'node:test';
import plugin from '../dist/index.mjs';

test('import', () => {
    plugin();
    assert.ok(plugin.postcss, 'plugin should have "postcss" flag');
    assert.equal(typeof plugin, 'function', 'plugin should return a function');
});
