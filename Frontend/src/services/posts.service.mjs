import api from './api.mjs';

const listPosts = async (params = {}, config = {}) => {
  const { data } = await api.get('/posts', { params, ...config });
  return data;
};

const getPost = async (id, config = {}) => {
  const { data } = await api.get(`/posts/${id}`, config);
  return data;
};

const createPost = async (formData, config = {}) => {
  const { data } = await api.post('/posts', formData, config);
  return data;
};

const updatePost = async (id, payload) => {
  const { data } = await api.patch(`/posts/${id}`, payload);
  return data;
};

const deletePost = async (id) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

const toggleLike = async (id) => {
  const { data } = await api.patch(`/posts/${id}/like`);
  return data;
};

const getComments = async (id, config = {}) => {
  const { data } = await api.get(`/posts/${id}/comments`, config);
  return data;
};

const addComment = async (id, text) => {
  const { data } = await api.post(`/posts/${id}/comments`, { text });
  return data;
};

const deleteComment = async (postId, commentId) => {
  const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return data;
};

const toggleBookmark = async (id) => {
  const { data } = await api.patch(`/posts/${id}/bookmark`);
  return data;
};

const getBookmarks = async (config = {}) => {
  const { data } = await api.get('/posts/bookmarks/me', config);
  return data;
};

const getPostQr = async (id, config = {}) => {
  const { data } = await api.get(`/posts/${id}/qr`, config);
  return data;
};

const postsService = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
  toggleBookmark,
  getBookmarks,
  getPostQr,
};

export default postsService;
