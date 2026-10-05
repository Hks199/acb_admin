import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

test('admin controls load saved settings and save selected designs, threshold, and rate', async () => {
  const source = readFileSync(new URL('../src/pages/offers/TshirtOffer.jsx', import.meta.url), 'utf8');
  const code = transformSync(source, { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code;
  const saved = [];
  const slots = [];
  const effects = [];
  let cursor = 0;
  let firstRender = true;
  const dependencies = {
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
      useEffect: (effect) => { if (firstRender) effects.push(effect); },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@mui/material': Object.fromEntries(['Alert', 'Autocomplete', 'Button', 'Checkbox', 'FormControlLabel', 'Switch', 'TextField'].map((name) => [name, name])),
    '../../api/offers': {
      getTshirtOffer: async () => ({ data: { offer: { enabled: false, minimumQuantity: 3, unitPrice: 333, eligibleProductIds: [], combineProducts: true, stackDiscounts: false } } }),
      saveTshirtOffer: async (offer) => { saved.push(offer); return { data: { offer } }; },
    },
    '../../api/varients': { getAllVarient: async () => ({ data: { totalPages: 1, data: [{ productId: 'shirt', varient_name: 'T-shirt' }] } }) },
  };
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => dependencies[name] || (() => {}) });
  const walk = (node) => {
    if (Array.isArray(node)) return node.flatMap(walk);
    if (!node || typeof node !== 'object') return [];
    return [node, ...walk(node.props?.children), ...walk(node.props?.control)];
  };
  const render = () => { cursor = 0; const tree = walk(module.exports.default()); firstRender = false; return tree; };
  render();
  effects.forEach((effect) => effect());
  await new Promise(setImmediate);
  let tree = render();
  assert.equal(tree.find((node) => node.type === 'Button' && node.props.children === 'Save offer').props.disabled, false);
  tree.find((node) => node.type === 'Switch').props.onChange({ target: { checked: true } });
  const selector = tree.find((node) => node.type === 'Autocomplete');
  selector.props.onChange(null, [selector.props.options[0]]);
  tree.find((node) => node.props?.label === 'Minimum T-shirt quantity').props.onChange({ target: { value: '4' } });
  tree.find((node) => node.props?.label === 'Offer price per T-shirt (₹)').props.onChange({ target: { value: '300' } });
  tree = render();
  await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault: () => {} });
  assert.equal(saved[0].enabled, true);
  assert.equal(saved[0].minimumQuantity, 4);
  assert.equal(saved[0].unitPrice, 300);
  assert.equal(saved[0].eligibleProductIds.join(','), 'shirt');
  assert.equal(saved[0].combineProducts, true);
  assert.equal(saved[0].stackDiscounts, false);
});
