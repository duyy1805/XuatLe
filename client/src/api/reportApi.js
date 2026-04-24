import axiosClient from './axiosClient';

const reportApi = {
  getDashboard: (params) => {
    return axiosClient.get('/dashboard', { params });
  },
  getReportTongHop: (params) => {
    return axiosClient.get('/report/tong-hop', { params });
  },
  getReportDoiSoat: (params) => {
    return axiosClient.get('/report/doi-soat', { params });
  },
  getReportTonTreo: (params) => {
    return axiosClient.get('/report/ton-treo', { params });
  }
};

export default reportApi;
