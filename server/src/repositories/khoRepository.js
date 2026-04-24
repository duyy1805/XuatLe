'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho Danh mục Kho.
 * SP: usp_XuatLe_DM_Kho_GetList
 */
const khoRepository = {
  async getList({ keyword, suDung = 1 } = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('Keyword', sql.NVarChar(100), keyword || null);
    req.input('SuDung', sql.Bit, suDung != null ? suDung : null);

    const result = await req.execute('dbo.usp_XuatLe_DM_Kho_GetList');
    return result.recordset;
  },
};

module.exports = khoRepository;
