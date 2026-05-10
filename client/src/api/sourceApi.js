import axiosClient from './axiosClient';

const sourceApi = {
  getKeHoach: (params) => {
    return axiosClient.get('/source/ke-hoach', { params });
  },
  getVatTu: (idKeHoachSanXuat, idDonHangSanPham) => {
    return axiosClient.get('/source/vat-tu', {
      params: { idKeHoachSanXuat, idDonHangSanPham }
    });
  },
  getVatTuPhoi: () => {
    return axiosClient.get('/source/vat-tu-phoi');
  },
  getDaMoPhoi: (idKeHoachSanXuat, idDonHangSanPham) => {
    return axiosClient.get('/source/da-mo-phoi', {
      params: { idKeHoachSanXuat, idDonHangSanPham }
    });
  },
  getPhieuNhapBTP: (params) => {
    return axiosClient.get('/source/phieu-nhap-btp', { params });
  }
};

export default sourceApi;
