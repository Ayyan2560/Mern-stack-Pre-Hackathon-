import api from './api.mjs';

const getNotifications = async (config = {}) => {
  const { data } = await api.get('/notifications', config);
  return data;
};

const getUnreadCount = async (config = {}) => {
  const { data } = await api.get('/notifications/unread-count', config);
  return data;
};

const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

const markAllAsRead = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data;
};

const notificationsService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default notificationsService;
