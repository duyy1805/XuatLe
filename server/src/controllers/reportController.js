'use strict';

const reportRepo = require('../repositories/reportRepository');
const { sendSuccess } = require('../utils/response');

const reportController = {
  /**
   * GET /api/dashboard
   * Query: tuNgay, denNgay, idBoPhan, idCongDoanLe, idNhaCungCap
   */
  async getDashboard(req, res, next) {
    try {
      const data = await reportRepo.getDashboardSummary({
        tuNgay: req.query.tuNgay || null,
        denNgay: req.query.denNgay || null,
        idBoPhan: req.query.idBoPhan ? Number(req.query.idBoPhan) : null,
        idCongDoanLe: req.query.idCongDoanLe ? Number(req.query.idCongDoanLe) : null,
        idNhaCungCap: req.query.idNhaCungCap ? Number(req.query.idNhaCungCap) : null,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/report/tong-hop
   * Query: tuNgay, denNgay, idCongDoanLe, idNhaCungCap
   */
  async reportTongHop(req, res, next) {
    try {
      const data = await reportRepo.reportTongHop({
        tuNgay: req.query.tuNgay || null,
        denNgay: req.query.denNgay || null,
        idCongDoanLe: req.query.idCongDoanLe ? Number(req.query.idCongDoanLe) : null,
        idNhaCungCap: req.query.idNhaCungCap ? Number(req.query.idNhaCungCap) : null,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/report/doi-soat
   * Query: tuNgay, denNgay
   */
  async reportDoiSoat(req, res, next) {
    try {
      const data = await reportRepo.reportDoiSoat({
        tuNgay: req.query.tuNgay || null,
        denNgay: req.query.denNgay || null,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/report/ton-treo
   * Query: tuNgay, denNgay
   */
  async reportTonTreo(req, res, next) {
    try {
      const data = await reportRepo.reportTonTreo({
        tuNgay: req.query.tuNgay || null,
        denNgay: req.query.denNgay || null,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = reportController;
