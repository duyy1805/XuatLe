import axiosClient from './axiosClient';

const authApi = {
  login: (tenDangNhap, matKhau) => {
    return axiosClient.post('/auth/login', { tenDangNhap, matKhau });
  },
};

export default authApi;
