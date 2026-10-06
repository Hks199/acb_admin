// Store the backend JWT for this browser tab only.
export const ADMIN_TOKEN_KEY = 'acbAdminToken';
export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY);
export const clearAdminSession = () => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem('acbAdminDemoSession');
};
