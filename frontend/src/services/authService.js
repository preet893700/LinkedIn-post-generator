import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies
});

export const authService = {
  signup: async (name, email, password, confirmPassword) => {
    const response = await authAPI.post('/auth/signup', {
      name,
      email,
      password,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await authAPI.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  refreshToken: async () => {
    const response = await authAPI.post('/auth/refresh');
    return response.data;
  },

  logout: async (token) => {
    const response = await authAPI.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getCurrentUser: async (token) => {
    const response = await authAPI.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getUserProfile: async (token) => {
    const response = await authAPI.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateUserProfile: async (token, profileData) => {
    const response = await authAPI.put('/user/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};