import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
const walk = (node) => {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children)];
};
const compile = (name, define) => transformSync(readFileSync(new URL(name, import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic', define }).code;
function setup(savedToken = null, rejectSession = false) {
  const slots = [], effects = [], calls = [];
  const storage = new Map(savedToken ? [['token', savedToken]] : []);
  let cursor = 0, first = true;
  const dependencies = {
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      }, useEffect: (effect) => { if (first) effects.push(effect); },
    },
    'react/jsx-runtime': jsx,
    'react-router': Object.fromEntries(['BrowserRouter', 'Routes', 'Route', 'Navigate', 'Outlet'].map((name) => [name, name])),
    'react-toastify': { ToastContainer: 'ToastContainer' },
    './lib/adminAuth': { ADMIN_TOKEN_KEY: 'token', getAdminToken: () => storage.get('token'), clearAdminSession: () => storage.clear() },
    './api/client': { get: async (path) => { calls.push(path); if (rejectSession) throw new Error('Invalid admin session'); return { data: { role: 'Admin' } }; },
      post: async (path, body) => { calls.push({ path, body }); return { data: { token: 'signed-admin-jwt' } }; } },
  };
  const module = { exports: {} };
  vm.runInNewContext(compile('../src/App.jsx'), { module, exports: module.exports, require: (name) => dependencies[name] || name,
    sessionStorage: { setItem: (key, value) => storage.set(key, value) }, window: { addEventListener() {}, removeEventListener() {} } });
  return { calls, storage, effects, render: () => { cursor = 0; const tree = walk(module.exports.default()); first = false; return tree; } };
}
test('dashboard validates saved JWT with backend and discards invalid sessions', async () => {
  for (const rejected of [false, true]) {
    const app = setup('saved-jwt', rejected);
    assert.equal(app.render()[0].props.role, 'status');
    app.effects.forEach((effect) => effect()); await new Promise(setImmediate);
    const loginRoute = app.render().find((node) => node.type === 'Route' && node.props.path === '/login');
    assert.equal(app.calls[0], 'admin/session');
    assert.equal(loginRoute.props.element.type, rejected ? './pages/login/Login' : 'Navigate');
    if (rejected) assert.equal(app.storage.size, 0);
  }
});
test('dashboard waits for real login, stores JWT, and clears it on logout', async () => {
  const app = setup(); app.render(); app.effects.forEach((effect) => effect()); await new Promise(setImmediate);
  let tree = app.render();
  const login = tree.find((node) => node.type === 'Route' && node.props.path === '/login').props.element;
  await login.props.onLogin('admin@example.com', 'test-password');
  assert.equal(app.calls[0].path, 'admin/login');
  assert.equal(app.storage.get('token'), 'signed-admin-jwt');
  tree = app.render();
  const protectedRoute = tree.find((node) => node.type === 'Route' && node.props.element?.type === './components/ParentComponent');
  assert.ok(protectedRoute);
  protectedRoute.props.element.props.onLogout();
  assert.equal(app.storage.size, 0);
  assert.equal(app.render().find((node) => node.type === 'Route' && node.props.path === '/login').props.element.type, './pages/login/Login');
});
test('shared API sends Bearer JWT and clears expired sessions without clearing permission errors', async () => {
  let token = 'signed-jwt', dispatched = 0;
  const request = [], response = [];
  const api = { interceptors: { request: { use: (...callbacks) => request.push(callbacks) }, response: { use: (...callbacks) => response.push(callbacks) } } };
  const module = { exports: {} };
  const dependencies = {
    axios: { create: () => api },
    '../lib/adminAuth': { getAdminToken: () => token, clearAdminSession: () => { token = null; } },
  };
  vm.runInNewContext(compile('../src/api/client.js', { 'import.meta.env.VITE_API_URL': '"https://example.com/api/"' }), {
    module, exports: module.exports, require: (name) => dependencies[name], Event,
    window: { dispatchEvent: (event) => { assert.equal(event.type, 'admin-session-expired'); dispatched++; } },
  });
  assert.equal(request[0][0]({ headers: {} }).headers.Authorization, 'Bearer signed-jwt');
  await assert.rejects(response[0][1]({ response: { status: 403 } }));
  assert.equal(token, 'signed-jwt');
  await assert.rejects(response[0][1]({ response: { status: 401 } }));
  assert.equal(token, null); assert.equal(dispatched, 1);
});
