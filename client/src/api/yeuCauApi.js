import axiosClient from './axiosClient';

const yeuCauApi = {
  getList: (params) => {
    return axiosClient.get('/yeu-cau', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/yeu-cau/${id}`);
  },
  getHistory: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/history`);
  },
  saveDraft: (data) => {
    if (data.id) {
      return axiosClient.put(`/yeu-cau/draft/${data.id}`, data);
    }
    return axiosClient.post('/yeu-cau/draft', data);
  },
  submit: (id) => {
    return axiosClient.post(`/yeu-cau/${id}/submit`);
  },
  approve: (id, data) => {
    return axiosClient.post(`/yeu-cau/${id}/approve`, data);
  },
  cancel: (id, data) => {
    return axiosClient.post(`/yeu-cau/${id}/cancel`, data);
  },
  close: (id) => {
    return axiosClient.post(`/yeu-cau/${id}/close`);
  },
  nhapLai: (id, data) => {
    return axiosClient.post(`/yeu-cau/${id}/nhap-lai`, data);
  },
  // Lệnh Xuất
  getLenhXuat: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/lenh-xuat`);
  },
  createLenhXuat: (id, data) => {
    return axiosClient.post(`/yeu-cau/${id}/lenh-xuat`, data);
  },
  unlinkLenhXuat: (id, idLenh) => {
    return axiosClient.delete(`/yeu-cau/${id}/lenh-xuat/${idLenh}`);
  },
  // Phiếu Xuất/Nhập (ERP sync)
  getPhieuXuat: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/phieu-xuat`);
  },
  getPhieuXuatDetail: (idPhieu) => {
    return axiosClient.get(`/yeu-cau/phieu-xuat/${idPhieu}`);
  },
  syncPhieuXuat: (id) => {
    return axiosClient.post(`/yeu-cau/${id}/sync-xuat`);
  },
  getPhieuNhap: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/phieu-nhap`);
  },
  getPhieuNhapDetail: (idPhieu) => {
    return axiosClient.get(`/yeu-cau/phieu-nhap/${idPhieu}`);
  },
  syncPhieuNhap: (id) => {
    return axiosClient.post(`/yeu-cau/${id}/sync-nhap`);
  },
  // Đối soát & Hao hụt
  getDoiSoatPhieuXuat: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/doi-soat/phieu-xuat`);
  },
  getDoiSoatXuatNhap: (id) => {
    return axiosClient.get(`/yeu-cau/${id}/doi-soat/xuat-nhap`);
  },
  updateHaoHut: (id, data) => {
    return axiosClient.put(`/yeu-cau/${id}/hao-hut`, data);
  }
};

export default yeuCauApi;
