import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
const walk = (node) => {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children), ...walk(node.props?.control)];
};
const settle = () => new Promise(setImmediate);
function setup() {
  const slots = [], effects = [], requests = [];
  let cursor = 0, first = true;
  let rows = [];
  const save = async (body, id = String(rows.length + 1)) => {
    requests.push({ id, body });
    if (body.isActive) rows.forEach((row) => { row.isActive = false; });
    const row = { ...body, _id: id };
    rows = [...rows.filter((old) => old._id !== id), row];
    return { data: row };
  };
  const dependencies = {
    react: {
      useCallback: (callback) => callback,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      }, useEffect: (effect) => { if (first) effects.push(effect); },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@mui/material': Object.fromEntries(['Alert', 'Box', 'Button', 'Chip', 'FormControlLabel', 'MenuItem', 'Stack', 'Switch', 'TextField', 'Typography'].map((name) => [name, name])),
    '../../api/announcements': {
      getAnnouncements: async () => ({ data: rows.map((row) => ({ ...row })) }),
      createAnnouncement: (body) => save(body), updateAnnouncement: (id, body) => save(body, id),
      toggleAnnouncement: (id, isActive) => save({ ...rows.find((row) => row._id === id), isActive }, id),
    },
  };
  const module = { exports: {} };
  const code = transformSync(readFileSync(new URL('../src/pages/announcements/Announcements.jsx', import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => dependencies[name] || (() => {}), URL });
  return { requests, effects, render: () => { cursor = 0; const result = walk(module.exports.default()); first = false; return result; } };
}
test('admin form creates, previews, edits and toggles announcements with live counters and link validation', async () => {
  const app = setup();
  app.render(); app.effects.forEach((effect) => effect()); await settle();
  let tree = app.render();
  const field = (label) => tree.find((node) => node.props?.label === label);
  field('Announcement text').props.onChange({ target: { value: 'Free shipping!' } });
  field('Badge label (optional)').props.onChange({ target: { value: 'OFFER' } });
  tree = app.render();
  field('Badge style').props.onChange({ target: { value: 'offer' } });
  field('Action link (optional)').props.onChange({ target: { value: 'javascript:alert(1)' } });
  tree.find((node) => node.type === 'Switch').props.onChange({ target: { checked: true } });
  tree = app.render();
  assert.equal(field('Announcement text').props.helperText, '14/255 characters');
  assert.equal(field('Badge label (optional)').props.helperText, '5/15 characters');
  assert.equal(field('Announcement text').props.slotProps.htmlInput.maxLength, 255);
  assert.equal(field('Badge label (optional)').props.slotProps.htmlInput.maxLength, 15);
  assert.equal(field('Action link (optional)').props.error, true);
  assert.equal(tree.find((node) => node.props?.type === 'submit').props.disabled, true);
  field('Action link (optional)').props.onChange({ target: { value: 'https://example.com/products' } });
  tree = app.render();
  assert.equal(tree.find((node) => node.props?.type === 'submit').props.disabled, false);
  await tree.find((node) => node.props?.component === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests[0].body.isActive, true);
  assert.equal(app.requests[0].body.badge.type, 'offer');
  assert.equal(app.requests[0].body.badge.text, 'OFFER');
  tree = app.render();
  await tree.find((node) => node.type === 'Button' && node.props.children === 'Deactivate').props.onClick();
  assert.equal(app.requests[1].body.isActive, false);
  tree = app.render();
  tree.find((node) => node.type === 'Button' && node.props.children === 'Edit').props.onClick();
  tree = app.render();
  field('Announcement text').props.onChange({ target: { value: 'New collection' } });
  tree = app.render();
  await tree.find((node) => node.props?.component === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests[2].id, '1');
  assert.equal(app.requests[2].body.text, 'New collection');
});
