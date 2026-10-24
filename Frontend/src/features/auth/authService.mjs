import api from "../../services/api.mjs";

const signup = async (userData) => {
  console.log("1. Signup service started");

  try {
    const response = await api.post("/auth/signup", userData);

    console.log("2. Signup response:", response.status, response.data);
    return response.data;
  } catch (error) {
    console.error("3. Signup request failed:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    throw error;
  }
};

const login = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const authService = { signup, login, getCurrentUser };

export default authService;