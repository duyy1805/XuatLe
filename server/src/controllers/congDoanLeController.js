'use strict';

const congDoanLeRepo = require('../repositories/congDoanLeRepository');
const { sendSuccess, sendError } = require('../utils/response');

const congDoanLeController = {
  /**
   * GET /api/dm/cong-doan-le
   * Query: keyword, suDung, tonTai
   */
  async getList(req, res, next) {
    try {
      const { keyword, suDung, tonTai } = req.query;
      const data = await congDoanLeRepo.getList({
        keyword,
        suDung: suDung != null ? Number(suDung) : null,
        tonTai: tonTai != null ? Number(tonTai) : 1,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/dm/cong-doan-le
   * Body: maCongDoanLe, tenCongDoanLe, loaiDoiTac, ...
   */
  async save(req, res, next) {
    try {
      const result = await congDoanLeRepo.save({
        ...req.body,
        taiKhoan: req.taiKhoan,
      });
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi lưu dữ liệu.');
      return sendSuccess(res, result, result.Message, 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/dm/cong-doan-le/:id
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return sendError(res, 'ID không hợp lệ.');

      const result = await congDoanLeRepo.delete(id, req.taiKhoan);
      if (result?.Code !== 0) return sendError(res, result?.Message || 'Lỗi xoá dữ liệu.');
      return sendSuccess(res, null, result.Message);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = congDoanLeController;
