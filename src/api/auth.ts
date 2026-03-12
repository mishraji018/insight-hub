import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/api/token/', {
      email,
      password,
    });
    return response.data;
  },

  register: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    invite_token: string;
  }) => {
    const response = await axiosInstance.post('/api/auth/register/', data);
    return response.data;
  },

  validateInvite: async (token: string) => {
    const response = await axiosInstance.get(
      `/api/auth/validate-invite/?token=${token}`
    );
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/api/auth/me/');
    return response.data;
  },

  refreshToken: async (refresh: string) => {
    const response = await axiosInstance.post('/api/token/refresh/', {
      refresh,
    });
    return response.data;
  },

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => {
    const response = await axiosInstance.post(
      '/api/auth/change-password/',
      data
    );
    return response.data;
  },
};

export default authApi;