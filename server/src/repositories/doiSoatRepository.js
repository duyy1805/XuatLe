'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho các nghiệp vụ đối soát và hao hụt.
 */
const doiSoatRepository = {
  /**
   * Đối soát phiếu xuất (so sánh số lượng đề nghị vs đã xuất).
   * SP: usp_XuatLe_DoiSoat_PhieuXuat
   */
  async doiSoatPhieuXuat(idYeuCau) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);

    const result = await req.execute('dbo.usp_XuatLe_DoiSoat_PhieuXuat');
    return result.recordset;
  },

  /**
   * Đối soát xuất – nhập (tổng xuất vs tổng nhập + hao hụt).
   * SP: usp_XuatLe_DoiSoat_XuatNhap
   */
  async doiSoatXuatNhap(idYeuCau) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);

    const result = await req.execute('dbo.usp_XuatLe_DoiSoat_XuatNhap');
    return result.recordset;
  },

  /**
   * Cập nhật số lượng hao hụt cho yêu cầu (toàn bộ hoặc theo dòng).
   * SP: usp_XuatLe_UpdateHaoHut
   */
  async updateHaoHut(params) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_XuatLe_YeuCau', sql.BigInt, params.idYeuCau);
    req.input('ID_Dong', sql.Int, params.idDong || null);
    req.input('SoLuong_HaoHut', sql.Decimal(18, 2), params.soLuongHaoHut);
    req.input('LyDo', sql.NVarChar(1000), params.lyDo || null);
    req.input('TaiKhoan', sql.SmallInt, params.taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_UpdateHaoHut');
    return result.recordset[0];
  },
};

module.exports = doiSoatRepository;
