import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

function setup({ failLoad = false, failSave = false } = {}) {
  const code = transformSync(readFileSync(new URL('../src/pages/offers/DiscountRules.jsx', import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code;
  const slots = [], effects = [], saved = [];
  let cursor = 0, firstRender = true;
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
    '@mui/material': Object.fromEntries(['Alert', 'Box', 'Button', 'FormControlLabel', 'InputAdornment', 'Switch', 'TextField', 'Typography'].map((name) => [name, name])),
    '../../api/discountRules': {
      getDiscountRules: async () => {
        if (failLoad) throw new Error('Offline');
        return { data: { rules: [
          { ruleKey: 'first_order_discount', discountPercentage: 12, minPurchaseAmount: null, isActive: false },
          { ruleKey: 'milestone_discount', discountPercentage: 7, minPurchaseAmount: 3999, isActive: true },
        ] } };
      },
      saveDiscountRule: async (key, payload) => {
        saved.push({ key, payload });
        if (failSave) throw new Error('Offline');
        return { data: { rule: { ruleKey: key, ...payload } } };
      },
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => dependencies[name] || (() => {}) });
  const walk = (node) => {
    if (Array.isArray(node)) return node.flatMap(walk);
    if (!node || typeof node !== 'object') return [];
    return [node, ...walk(node.props?.children), ...walk(node.props?.control)];
  };
  const render = () => { cursor = 0; const tree = walk(module.exports.default()); firstRender = false; return tree; };
  return { saved, render, mount: async () => { render(); effects.forEach((effect) => effect()); await new Promise(setImmediate); return render(); } };
}

test('admin loads live percentages and independently saves status, threshold and percentage as numbers', async () => {
  const app = setup();
  let tree = await app.mount();
  const rates = tree.filter((node) => node.props?.label === 'Discount percentage');
  assert.equal(rates[0].props.value, 12); assert.equal(rates[1].props.value, 7);
  const switches = tree.filter((node) => node.type === 'Switch');
  assert.equal(switches[0].props.checked, false); assert.equal(switches[1].props.checked, true);
  switches[0].props.onChange({ target: { checked: true } });
  rates[0].props.onChange({ target: { value: '15' } });
  tree = app.render();
  await tree.filter((node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(app.saved[0].key, 'first_order_discount');
  assert.equal(app.saved[0].payload.discountPercentage, 15);
  assert.equal(app.saved[0].payload.isActive, true);
  assert.equal(app.saved[0].payload.minPurchaseAmount, null);
  tree = app.render();
  tree.find((node) => node.props?.label === 'Minimum purchase amount').props.onChange({ target: { value: '2999.50' } });
  tree.filter((node) => node.props?.label === 'Discount percentage')[1].props.onChange({ target: { value: '8.5' } });
  tree.filter((node) => node.type === 'Switch')[1].props.onChange({ target: { checked: false } });
  tree = app.render();
  await tree.filter((node) => node.type === 'form')[1].props.onSubmit({ preventDefault() {} });
  assert.equal(app.saved[1].key, 'milestone_discount');
  assert.equal(app.saved[1].payload.minPurchaseAmount, 2999.5);
  assert.equal(app.saved[1].payload.discountPercentage, 8.5);
  assert.equal(app.saved[1].payload.isActive, false);
});

test('failed loads disable saves; failed saves retain edits and show errors without success', async () => {
  const offline = setup({ failLoad: true });
  const tree = await offline.mount();
  assert.equal(tree.filter((node) => node.type === 'Button' && node.props.children === 'Save rule').every((node) => node.props.disabled), true);
  assert.ok(tree.some((node) => node.type === 'Alert' && node.props.severity === 'error'));
  const app = setup({ failSave: true });
  let loaded = await app.mount();
  loaded.filter((node) => node.props?.label === 'Discount percentage')[0].props.onChange({ target: { value: '16' } });
  loaded = app.render();
  await loaded.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  loaded = app.render();
  assert.equal(loaded.filter((node) => node.props?.label === 'Discount percentage')[0].props.value, '16');
  assert.ok(loaded.some((node) => node.type === 'Alert' && node.props.severity === 'error'));
  assert.equal(loaded.some((node) => node.type === 'Alert' && node.props.severity === 'success'), false);
});
