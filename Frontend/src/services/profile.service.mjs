import api from './api.mjs';

const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

const updateProfile = async ({ name }) => {
  const { data } = await api.put('/profile', { name });
  return data;
};

const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.patch('/profile/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};

const uploadProfilePicture = async (file, config = {}) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const { data } = await api.patch('/profile/picture', formData, config);
  return data;
};

const removeProfilePicture = async () => {
  const { data } = await api.delete('/profile/picture');
  return data;
};

const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  removeProfilePicture,
};

export default profileService;
