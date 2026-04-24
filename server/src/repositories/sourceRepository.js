'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho dữ liệu nguồn (Kế hoạch sản xuất + Vật tư).
 */
const sourceRepository = {
  /**
   * Lấy danh sách kế hoạch sản xuất để chọn khi tạo yêu cầu xuất lẻ.
   * SP: usp_XuatLe_Source_KeHoach_GetList
   */
  async getKeHoachList(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('TuNgay', sql.Date, params.tuNgay || "2025-06-02");
    req.input('DenNgay', sql.Date, params.denNgay || "2025-06-02");
    req.input('Ma_DonHang', sql.NVarChar(100), params.maDonHang || null);
    req.input('So_LenhSanXuat', sql.NVarChar(20), params.soLenhSanXuat || null);
    req.input('ItemCode', sql.NVarChar(50), params.itemCode || null);
    req.input('ID_BoPhan', sql.SmallInt, params.idBoPhan || null);
    req.input('ID_QuyTrinhSanXuat', sql.TinyInt, params.idQuyTrinhSanXuat || null);
    req.input('Keyword', sql.NVarChar(100), params.keyword || null);

    const result = await req.execute('dbo.usp_XuatLe_Source_KeHoach_GetList');
    return result.recordset;
  },

  /**
   * Lấy danh sách vật tư theo kế hoạch sản xuất.
   * SP: usp_XuatLe_Source_VatTu_GetByKeHoach
   */
  async getVatTuByKeHoach(idKeHoachSanXuat, idDonHangSanPham = null) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_KeHoachSanXuat', sql.Int, idKeHoachSanXuat);
    req.input('ID_DonHang_SanPham', sql.Int, idDonHangSanPham || null);

    const result = await req.execute('dbo.usp_XuatLe_Source_VatTu_GetByKeHoach');
    return result.recordset;
  },
};

module.exports = sourceRepository;
