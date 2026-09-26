import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('admin_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const get = async <T = any>(
  url: string,
  config?: any,
): Promise<T> => {
  const response = await api.get<T>(
    url,
    config,
  );

  return response.data;
};

export const post = async <
  T = any,
  D = any,
>(
  url: string,
  data?: D,
  config?: any,
): Promise<T> => {
  const response = await api.post<T>(
    url,
    data,
    config,
  );

  return response.data;
};

export const patch = async <
  T = any,
  D = any,
>(
  url: string,
  data?: D,
  config?: any,
): Promise<T> => {
  const response = await api.patch<T>(
    url,
    data,
    config,
  );

  return response.data;
};

export const del = async <T = any>(
  url: string,
  config?: any,
): Promise<T> => {
  const response = await api.delete<T>(
    url,
    config,
  );

  return response.data;
};

export const put = async <
  T = any,
  D = any,
>(
  url: string,
  data?: D,
  config?: any,
): Promise<T> => {
  const response = await api.put<T>(
    url,
    data,
    config,
  );

  return response.data;
};

export default api;