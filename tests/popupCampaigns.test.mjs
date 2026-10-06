import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
import * as helpers from '../src/lib/popupCampaigns.js';
const walk = (node) => Array.isArray(node) ? node.flatMap(walk) : !node || typeof node !== 'object' ? [] : [node, ...walk(node.props?.children), ...walk(node.props?.control)];
function setup(initialRows = []) {
  const states = [], effects = [], requests = []; let cursor = 0, first = true, rows = initialRows;
  const save = async (body, id = String(rows.length + 1)) => {
    requests.push({ method: 'save', id, body }); const row = { ...body, _id: id };
    rows = [...rows.filter((old) => old._id !== id), row]; return { data: row };
  };
  const dependencies = {
    react: { useCallback: (callback) => callback, useState: (initial) => {
      const index = cursor++; if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    }, useEffect: (effect) => { if (first) effects.push(effect); } },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@mui/material': Object.fromEntries(['Alert', 'Button', 'Chip', 'FormControlLabel', 'MenuItem', 'Stack', 'Switch', 'TextField', 'Typography'].map((name) => [name, name])),
    'react-icons/fi': Object.fromEntries(['FiArrowDown', 'FiArrowUp', 'FiMenu', 'FiPlus', 'FiUpload'].map((name) => [name, name])),
    '../../lib/popupCampaigns': helpers,
    '../../api/popupCampaigns': {
      getPopupCampaigns: async () => ({ data: rows }), createPopupCampaign: (body) => save(body), updatePopupCampaign: (id, body) => save(body, id),
      togglePopupCampaign: (id, isActive) => save({ ...rows.find((row) => row._id === id), isActive }, id),
      deletePopupCampaign: async (id) => { rows = rows.filter((row) => row._id !== id); },
      reorderPopupCampaigns: async (ids) => { requests.push({ method: 'reorder', ids }); rows = ids.map((id, index) => ({ ...rows.find((row) => row._id === id), priority_order: index + 1 })); return { data: rows }; },
      uploadPopupImage: async (file) => { requests.push({ method: 'upload', file }); return { data: { imageUrl: 'https://example.com/campaign.png' } }; },
      getPopupSubscriptions: async () => ({ data: [] }),
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(transformSync(readFileSync(new URL('../src/pages/promotions/PopupCampaigns.jsx', import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code, { module, exports: module.exports, require: (name) => dependencies[name] || name, URL });
  return { effects, requests, render: () => { cursor = 0; const tree = walk(module.exports.default()); first = false; return tree; } };
}
const loaded = async (rows) => { const app = setup(rows); app.render(); app.effects.forEach((effect) => effect()); await new Promise(setImmediate); return app; };
test('admin edits preview live, validates CTA URLs, uploads to S3, and saves all campaign fields', async () => {
  const app = await loaded(); let tree = app.render();
  const field = (label) => tree.find((node) => node.props?.label === label);
  field('Title').props.onChange({ target: { value: 'Unlock 10% off' } });
  field('Subtitle').props.onChange({ target: { value: 'Our next collection' } });
  field('Coupon code (optional)').props.onChange({ target: { value: 'FIRST10' } });
  field('Image fit').props.onChange({ target: { value: 'contain' } });
  field('Image position').props.onChange({ target: { value: 'top' } });
  tree.find((node) => node.type === 'FormControlLabel' && node.props.label === 'Show image on mobile').props.control.props.onChange({ target: { checked: false } });
  field('Background theme').props.onChange({ target: { value: 'glass_light' } });
  field('CTA target').props.onChange({ target: { value: 'javascript:alert(1)' } });
  tree.find((node) => node.type === 'Switch').props.onChange({ target: { checked: true } });
  tree = app.render(); assert.equal(tree.find((node) => node.props?.type === 'submit').props.disabled, true);
  const preview = tree.find((node) => node.type === '../../components/promotions/CampaignPreview');
  assert.equal(preview.props.campaign.title, 'Unlock 10% off'); assert.equal(preview.props.campaign.couponCode, 'FIRST10');
  field('CTA target').props.onChange({ target: { value: '/products' } }); tree = app.render();
  const file = { type: 'image/png', size: 100 };
  await tree.find((node) => node.props?.type === 'file').props.onChange({ target: { files: [file], value: 'image.png' } });
  tree = app.render(); assert.equal(field('Image URL').props.value, 'https://example.com/campaign.png');
  await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  const saved = app.requests.find((request) => request.method === 'save');
  assert.equal(saved.body.title, 'Unlock 10% off'); assert.equal(saved.body.couponCode, 'FIRST10');
  assert.equal(saved.body.imageFit, 'contain'); assert.equal(saved.body.imagePosition, 'top'); assert.equal(saved.body.showImageOnMobile, false);
  assert.equal(saved.body.imageUrl, 'https://example.com/campaign.png'); assert.equal(saved.body.isActive, true); assert.equal(saved.body.backgroundTheme, 'glass_light');
});
test('drag-and-drop persists order and updates the edited priority; active campaigns stay independent', async () => {
  const rows = ['First', 'Second', 'Third'].map((title, index) => ({ ...helpers.newCampaign(), _id: String(index + 1), title, isActive: true, priority_order: index + 1 }));
  const app = await loaded(rows); let tree = app.render();
  tree.find((node) => node.type === 'Button' && node.props.children === 'Edit').props.onClick();
  tree = app.render(); const cards = tree.filter((node) => node.type === 'article');
  assert.equal(cards[0].props.draggable, true);
  await cards[0].props.onDrop({ preventDefault() {}, dataTransfer: { getData: () => '3' } });
  await new Promise(setImmediate);
  assert.equal(app.requests[0].ids.join(','), '3,1,2');
  tree = app.render(); await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests[1].body.priority_order, 2); assert.equal(app.requests[1].id, '1');
  tree = app.render(); await tree.find((node) => node.type === 'Button' && node.props.children === 'Pause').props.onClick();
  assert.equal(app.requests[2].body.isActive, false);
  assert.equal(app.render().find((node) => node.type === 'Chip').props.label, '2 active');
});
