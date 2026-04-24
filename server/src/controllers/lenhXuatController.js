'use strict';

const lenhXuatRepo = require('../repositories/lenhXuatRepository');
const { sendSuccess, sendError } = require('../utils/response');

const lenhXuatController = {
  // ─── LỆNH XUẤT ───────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/:id/lenh-xuat
   * Tạo lệnh xuất vật tư trong ERP.
   * Body: { idHinhThucXuatVT, idKhoXuat, idKhoNhap?, nguoiNhanHang?, noiDen?, lyDoXuat?, ghiChu? }
   */
  async createLenhXuat(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10);
      if (!idYeuCau) return sendError(res, 'ID yêu cầu không hợp lệ.');
      if (!req.body.idHinhThucXuatVT) return sendError(res, 'idHinhThucXuatVT là bắt buộc.');
      if (!req.body.idKhoXuat) return sendError(res, 'idKhoXuat là bắt buộc.');

      const result = await lenhXuatRepo.createLenhXuat({
        idYeuCau,
        ...req.body,
        taiKhoan: req.taiKhoan,
      });
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi tạo lệnh xuất.');
      return sendSuccess(res, result, result.Message, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/yeu-cau/:id/lenh-xuat
   */
  async getLenhXuat(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10);
      if (!idYeuCau) return sendError(res, 'ID không hợp lệ.');

      const data = await lenhXuatRepo.getLenhXuatByYeuCau(idYeuCau);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/yeu-cau/:id/lenh-xuat/:idLenh
   */
  async unlinkLenhXuat(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10);
      const idLenhXuatVT = parseInt(req.params.idLenh, 10);
      if (!idYeuCau || !idLenhXuatVT) return sendError(res, 'ID không hợp lệ.');

      const result = await lenhXuatRepo.unlinkLenhXuat(idYeuCau, idLenhXuatVT, req.taiKhoan);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi huỷ liên kết.');
      return sendSuccess(res, null, result.Message);
    } catch (err) {
      next(err);
    }
  },

  // ─── PHIẾU XUẤT ──────────────────────────────────────────────────────────────

  /**
   * GET /api/yeu-cau/:id/phieu-xuat
   */
  async getPhieuXuat(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10);
      if (!idYeuCau) return sendError(res, 'ID không hợp lệ.');

      const data = await lenhXuatRepo.getPhieuXuatByYeuCau(idYeuCau);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/phieu-xuat/:idPhieu/chi-tiet
   */
  async getPhieuXuatDetail(req, res, next) {
    try {
      const idPhieu = parseInt(req.params.idPhieu, 10);
      if (!idPhieu) return sendError(res, 'ID phiếu không hợp lệ.');

      const data = await lenhXuatRepo.getPhieuXuatDetail(idPhieu);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/yeu-cau/:id/sync-xuat
   * Đồng bộ phiếu xuất từ ERP.
   */
  async syncPhieuXuat(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10) || null;
      const result = await lenhXuatRepo.syncPhieuXuat(idYeuCau);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi đồng bộ phiếu xuất.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },

  // ─── PHIẾU NHẬP ──────────────────────────────────────────────────────────────

  /**
   * GET /api/yeu-cau/:id/phieu-nhap
   */
  async getPhieuNhap(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10);
      if (!idYeuCau) return sendError(res, 'ID không hợp lệ.');

      const data = await lenhXuatRepo.getPhieuNhapByYeuCau(idYeuCau);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/phieu-nhap/:idPhieu/chi-tiet
   */
  async getPhieuNhapDetail(req, res, next) {
    try {
      const idPhieu = parseInt(req.params.idPhieu, 10);
      if (!idPhieu) return sendError(res, 'ID phiếu không hợp lệ.');

      const data = await lenhXuatRepo.getPhieuNhapDetail(idPhieu);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/yeu-cau/:id/sync-nhap
   * Đồng bộ phiếu nhập từ ERP.
   */
  async syncPhieuNhap(req, res, next) {
    try {
      const idYeuCau = parseInt(req.params.id, 10) || null;
      const result = await lenhXuatRepo.syncPhieuNhap(idYeuCau);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi đồng bộ phiếu nhập.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = lenhXuatController;
