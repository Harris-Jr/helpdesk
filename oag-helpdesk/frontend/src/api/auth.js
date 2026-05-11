import apiClient from './apiClient';

const TOKEN_KEY = 'oag_access_token';

export const auth = {
  async login(credentials) {
    const result = await apiClient.post('/auth/login', credentials);
    if (result.token) localStorage.setItem(TOKEN_KEY, result.token);
    return result.user || result;
  },

  async register(payload) {
    const result = await apiClient.post('/auth/register', payload);
    if (result.token) localStorage.setItem(TOKEN_KEY, result.token);
    return result.user || result;
  },

  async me() {
    return apiClient.get('/auth/me');
  },

  logout(redirectTo) {
    localStorage.removeItem(TOKEN_KEY);
    if (redirectTo) window.location.assign(redirectTo);
  },

  redirectToLogin(redirectTo) {
    const target = redirectTo ? `/?redirect=${encodeURIComponent(redirectTo)}` : '/';
    window.location.assign(target);
  }
};

export default auth;
