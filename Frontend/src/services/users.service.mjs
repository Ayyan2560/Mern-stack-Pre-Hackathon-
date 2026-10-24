import api from './api.mjs';

const searchUsers = async (query, { page = 1, limit = 8, signal } = {}) => {
  const { data } = await api.get('/users/search', {
    params: { q: query, page, limit },
    signal,
  });
  return data;
};

const getUserById = async (userId, config = {}) => {
  const { data } = await api.get(`/users/${userId}`, config);
  return data;
};

const usersService = {
  searchUsers,
  getUserById,
};

export default usersService;
