import axiosClient from './axiosClient';

const dmApi = {
  getCongDoanLe: (params) => {
    return axiosClient.get('/dm/cong-doan-le', { params });
  },
  getKho: (params) => {
    return axiosClient.get('/dm/kho', { params });
  },
  getNhaCungCap: (params) => {
    return axiosClient.get('/dm/nha-cung-cap', { params });
  },
  getBoPhan: (params) => {
    return axiosClient.get('/dm/bo-phan', { params });
  }
};

export default dmApi;
