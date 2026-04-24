'use strict';

const doiSoatRepo = require('../repositories/doiSoatRepository');
const { sendSuccess, sendError } = require('../utils/response');

const doiSoatController = {
  /**
   * GET /api/yeu-cau/:id/doi-soat/phieu-xuat
   * Đối soát: số lượng đề nghị vs đã xuất theo từng vật tư.
   */
  async doiSoatPhieuXuat(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const data = await doiSoatRepo.doiSoatPhieuXuat(id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/yeu-cau/:id/doi-soat/xuat-nhap
   * Đối soát tổng xuất – nhập – hao hụt – đang treo.
   */
  async doiSoatXuatNhap(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const data = await doiSoatRepo.doiSoatXuatNhap(id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/yeu-cau/:id/hao-hut
   * Cập nhật hao hụt.
   * Body: { idDong?: number, soLuongHaoHut: number, lyDo?: string }
   */
  async updateHaoHut(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');
      if (req.body.soLuongHaoHut == null) return sendError(res, 'soLuongHaoHut là bắt buộc.');

      const result = await doiSoatRepo.updateHaoHut({
        idYeuCau: id,
        idDong: req.body.idDong || null,
        soLuongHaoHut: Number(req.body.soLuongHaoHut),
        lyDo: req.body.lyDo,
        taiKhoan: req.taiKhoan,
      });
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi cập nhật hao hụt.');
      return sendSuccess(res, null, result.Message);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = doiSoatController;
