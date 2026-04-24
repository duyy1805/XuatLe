'use strict';

const khoRepo = require('../repositories/khoRepository');
const nccRepo = require('../repositories/nhaCungCapRepository');
const { sendSuccess } = require('../utils/response');

const dmController = {
  /**
   * GET /api/dm/kho
   * Query: keyword, suDung
   */
  async getKhoList(req, res, next) {
    try {
      const { keyword, suDung } = req.query;
      const data = await khoRepo.getList({
        keyword,
        suDung: suDung != null ? Number(suDung) : 1,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/dm/nha-cung-cap
   * Query: keyword, suDung
   */
  async getNhaCungCapList(req, res, next) {
    try {
      const { keyword, suDung } = req.query;
      const data = await nccRepo.getList({
        keyword,
        suDung: suDung != null ? Number(suDung) : 1,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dmController;
