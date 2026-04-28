'use strict';

const { getPool, sql } = require('../config/db');

const boPhanRepository = {
  /**
   * Lấy danh sách bộ phận từ ERP.
   * SP: usp_XuatLe_DM_BoPhan_GetList
   */
  async getList(params) {
    const pool = getPool();
    const req = pool.request();
    req.input('Keyword', sql.NVarChar(100), params.keyword || null);
    req.input('SuDung', sql.Bit, params.suDung != null ? params.suDung : 1);

    const result = await req.execute('dbo.usp_XuatLe_DM_BoPhan_GetList');
    return result.recordset;
  }
};

module.exports = boPhanRepository;
