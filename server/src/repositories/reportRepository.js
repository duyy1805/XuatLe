'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho báo cáo và dashboard.
 */
const reportRepository = {
  /**
   * Dashboard tổng hợp (số liệu nhanh).
   * SP: usp_XuatLe_Dashboard_Summary
   */
  async getDashboardSummary(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('TuNgay', sql.Date, params.tuNgay || null);
    req.input('DenNgay', sql.Date, params.denNgay || null);
    req.input('ID_BoPhan', sql.SmallInt, params.idBoPhan || null);
    req.input('ID_CongDoanLe', sql.Int, params.idCongDoanLe || null);
    req.input('ID_NhaCungCap', sql.SmallInt, params.idNhaCungCap || null);

    const result = await req.execute('dbo.usp_XuatLe_Dashboard_Summary');
    return result.recordset[0];
  },

  /**
   * Báo cáo tổng hợp yêu cầu xuất lẻ.
   * SP: usp_XuatLe_Report_TongHop
   */
  async reportTongHop(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('TuNgay', sql.Date, params.tuNgay || null);
    req.input('DenNgay', sql.Date, params.denNgay || null);
    req.input('ID_CongDoanLe', sql.Int, params.idCongDoanLe || null);
    req.input('ID_NhaCungCap', sql.SmallInt, params.idNhaCungCap || null);

    const result = await req.execute('dbo.usp_XuatLe_Report_TongHop');
    return result.recordset;
  },

  /**
   * Báo cáo đối soát xuất nhập.
   * SP: usp_XuatLe_Report_DoiSoat
   */
  async reportDoiSoat(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('TuNgay', sql.Date, params.tuNgay || null);
    req.input('DenNgay', sql.Date, params.denNgay || null);

    const result = await req.execute('dbo.usp_XuatLe_Report_DoiSoat');
    return result.recordset;
  },

  /**
   * Báo cáo tồn treo (vật tư đã xuất chưa nhập về).
   * SP: usp_XuatLe_Report_TonTreo
   */
  async reportTonTreo(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('TuNgay', sql.Date, params.tuNgay || null);
    req.input('DenNgay', sql.Date, params.denNgay || null);

    const result = await req.execute('dbo.usp_XuatLe_Report_TonTreo');
    return result.recordset;
  },
};

module.exports = reportRepository;
