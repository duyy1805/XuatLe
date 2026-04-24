import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Luôn đính kèm tài khoản mặc định để pass qua middleware auth của backend
    config.headers['x-tai-khoan'] = import.meta.env.VITE_DEFAULT_TAI_KHOAN || '1';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Handle error globally
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối Server';
    // Ở đây có thể tích hợp toast notification
    console.error('API Error:', message);
    return Promise.reject(error.response?.data || { success: false, message });
  }
);

export default axiosClient;
