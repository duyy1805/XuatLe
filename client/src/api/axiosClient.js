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
    // Đính kèm JWT token nếu có
    const token = localStorage.getItem('xuatle_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
    // Nếu 401 Unauthorized → xóa token, redirect về login
    if (error.response?.status === 401) {
      localStorage.removeItem('xuatle_token');
      localStorage.removeItem('xuatle_user');
      // Chỉ redirect nếu đang không ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || error.message || 'Lỗi kết nối Server';
    console.error('API Error:', message);
    return Promise.reject(error.response?.data || { success: false, message });
  }
);

export default axiosClient;
