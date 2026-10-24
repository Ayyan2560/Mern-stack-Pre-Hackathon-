import api from './api.mjs';

const signup = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data;
};

const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

const verifyEmail = async ({ email, otp }) => {
  const { data } = await api.post('/auth/verify-email', { email, otp });
  return data;
};

const forgotPassword = async ({ email }) => {
  // The backend route is deliberately capitalised: /auth/forgot-Password
  const { data } = await api.post('/auth/forgot-Password', { email });
  return data;
};

const resetPassword = async ({ email, otp, password }) => {
  const { data } = await api.post('/auth/reset-password', { email, otp, password });
  return data;
};

const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

const authService = {
  signup,
  login,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
};

export default authService;
