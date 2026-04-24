'use strict';

const yeuCauRepo = require('../repositories/yeuCauRepository');
const { sendSuccess, sendError } = require('../utils/response');

const yeuCauController = {
  // ─── GET LIST ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/yeu-cau
   * Query: keyword, trangThai, tuNgay, denNgay, idCongDoanLe, idNhaCungCap, idKeHoachSanXuat, idDonHangSanPham
   */
  async getList(req, res, next) {
    try {
      const params = {
        keyword: req.query.keyword,
        trangThai: req.query.trangThai != null ? Number(req.query.trangThai) : null,
        tuNgay: req.query.tuNgay || null,
        denNgay: req.query.denNgay || null,
        idCongDoanLe: req.query.idCongDoanLe ? Number(req.query.idCongDoanLe) : null,
        idNhaCungCap: req.query.idNhaCungCap ? Number(req.query.idNhaCungCap) : null,
        idKeHoachSanXuat: req.query.idKeHoachSanXuat ? Number(req.query.idKeHoachSanXuat) : null,
        idDonHangSanPham: req.query.idDonHangSanPham ? Number(req.query.idDonHangSanPham) : null,
      };
      const data = await yeuCauRepo.getList(params);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // ─── GET DETAIL ───────────────────────────────────────────────────────────────

  /**
   * GET /api/yeu-cau/:id
   */
  async getByID(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const data = await yeuCauRepo.getByID(id);
      if (!data.header) return sendError(res, 'Không tìm thấy yêu cầu.', 404);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // ─── GET HISTORY ──────────────────────────────────────────────────────────────

  /**
   * GET /api/yeu-cau/:id/history
   */
  async getHistory(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const data = await yeuCauRepo.getHistory(id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // ─── SAVE DRAFT ───────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/draft
   * Tạo mới (id = null) hoặc cập nhật draft (truyền id).
   * Body: { id?, idLenhSanXuat, idKeHoachSanXuat, idDonHang, idDonHangSanPham,
   *         idCongDoanLe, idBoPhanNguon, idBoPhanNhan?, idNhaCungCap?,
   *         ngayYeuCau, ngayDuKienXuat?, deadlineHoanThanh?,
   *         ghiChu?, chiTiet: [...] }
   */
  async saveDraft(req, res, next) {
    try {
      const params = { ...req.body, taiKhoan: req.taiKhoan };

      if (!params.idCongDoanLe) return sendError(res, 'idCongDoanLe là bắt buộc.');
      if (!params.idBoPhanNguon) return sendError(res, 'idBoPhanNguon là bắt buộc.');
      if (!params.ngayYeuCau) return sendError(res, 'ngayYeuCau là bắt buộc.');
      if (!Array.isArray(params.chiTiet) || params.chiTiet.length === 0)
        return sendError(res, 'chiTiet không được rỗng.');

      const result = await yeuCauRepo.saveDraft(params);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi lưu Draft.');
      return sendSuccess(res, result, result.Message, params.id ? 200 : 201);
    } catch (err) {
      next(err);
    }
  },

  // ─── SUBMIT ───────────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/:id/submit
   * Trình duyệt yêu cầu (Draft → WaitApprove).
   */
  async submit(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const result = await yeuCauRepo.submit(id, req.taiKhoan);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi trình duyệt.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },

  // ─── APPROVE ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/:id/approve
   * Phê duyệt hoặc từ chối.
   * Body: { isApprove: true|false, lyDo?: string }
   */
  async approve(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');
      if (req.body.isApprove == null) return sendError(res, 'isApprove là bắt buộc.');

      const result = await yeuCauRepo.approve(
        id,
        req.body.isApprove,
        req.body.lyDo,
        req.taiKhoan
      );
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi phê duyệt.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },

  // ─── CANCEL ───────────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/:id/cancel
   * Huỷ yêu cầu.
   * Body: { lyDo?: string }
   */
  async cancel(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const result = await yeuCauRepo.cancel(id, req.body?.lyDo, req.taiKhoan);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi huỷ yêu cầu.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },

  // ─── CLOSE ────────────────────────────────────────────────────────────────────

  /**
   * POST /api/yeu-cau/:id/close
   * Đóng / hoàn thành yêu cầu.
   */
  async close(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const result = await yeuCauRepo.close(id, req.taiKhoan);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi đóng yêu cầu.');
      return sendSuccess(res, result, result.Message);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = yeuCauController;
