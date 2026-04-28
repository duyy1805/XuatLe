'use strict';

const sourceRepo = require('../repositories/sourceRepository');
const { sendSuccess, sendError } = require('../utils/response');

const sourceController = {
  /**
   * GET /api/source/ke-hoach
   * Lấy danh sách kế hoạch sản xuất để người dùng chọn.
   * Query: tuNgay, denNgay, maDonHang, soLenhSanXuat, itemCode, idBoPhan, idQuyTrinhSanXuat, keyword
   */
  async getKeHoachList(req, res, next) {
    try {
      const data = await sourceRepo.getKeHoachList(req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/source/vat-tu
   * Lấy danh sách vật tư theo kế hoạch.
   * Query: idKeHoachSanXuat (bắt buộc), idDonHangSanPham
   */
  async getVatTuByKeHoach(req, res, next) {
    try {
      const { idKeHoachSanXuat, idDonHangSanPham } = req.query;
      if (!idKeHoachSanXuat) return sendError(res, 'idKeHoachSanXuat là bắt buộc.');

      const data = await sourceRepo.getVatTuByKeHoach(
        parseInt(idKeHoachSanXuat, 10),
        idDonHangSanPham ? parseInt(idDonHangSanPham, 10) : null
      );
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/source/vat-tu-phoi
   * Lấy danh sách vật tư Phôi.
   */
  async getVatTuPhoi(req, res, next) {
    try {
      const data = await sourceRepo.getVatTuPhoi();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
  /**
   * GET /api/source/da-mo-phoi
   */
  async getDaMoPhoi(req, res, next) {
    try {
      const { idKeHoachSanXuat, idDonHangSanPham } = req.query;
      if (!idKeHoachSanXuat) return sendError(res, 'idKeHoachSanXuat là bắt buộc.');
      const data = await sourceRepo.getDaMoPhoi(
        parseInt(idKeHoachSanXuat, 10),
        idDonHangSanPham ? parseInt(idDonHangSanPham, 10) : null
      );
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = sourceController;
