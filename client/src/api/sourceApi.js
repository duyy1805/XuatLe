import axiosClient from './axiosClient';

const sourceApi = {
  getKeHoach: (params) => {
    return axiosClient.get('/source/ke-hoach', { params });
  },
  getVatTu: (idKeHoachSanXuat, idDonHangSanPham) => {
    return axiosClient.get('/source/vat-tu', {
      params: { idKeHoachSanXuat, idDonHangSanPham }
    });
  }
};

export default sourceApi;
