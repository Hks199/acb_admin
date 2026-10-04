export const DEMO_USER_ID = 'admin';
export const DEMO_PASSWORD = 'Admin@123';

const SESSION_KEY = 'acbAdminDemoSession';

export const hasDemoSession = () => sessionStorage.getItem(SESSION_KEY) === 'signed-in';

export const loginWithDemoCredentials = (userId, password) => {
  if (userId.trim() !== DEMO_USER_ID || password !== DEMO_PASSWORD) return false;
  sessionStorage.setItem(SESSION_KEY, 'signed-in');
  return true;
};

export const clearDemoSession = () => sessionStorage.removeItem(SESSION_KEY);
