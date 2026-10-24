import api from "../../services/api.mjs";

const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

const login = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const authService = {
  signup,
  login,
  getCurrentUser,
};

export default authService;
