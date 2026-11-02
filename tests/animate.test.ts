import test from 'node:test';
import assert from 'node:assert/strict';
import { animateText } from '../src/utils/animate-text';
import type { Root, Element } from 'hast';
test('animated spans use valid HAST className arrays', () => {
 const tree: Root = { type: 'root', children: [{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'Hello' }] }] };
 animateText('en')(tree);
 const span = (tree.children[0] as Element).children[0] as Element;
 assert.deepEqual(span.properties.className, ['animate-fade-in']);
});
