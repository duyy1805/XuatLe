'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho lệnh xuất kho & phiếu xuất/nhập (ERP sync).
 */
const lenhXuatRepository = {
  // ─── Lệnh xuất ───────────────────────────────────────────────────────────────

  /**
   * Tạo lệnh xuất vật tư trong ERP.
   * SP: usp_XuatLe_CreateLenhXuatVT
   */
  async createLenhXuat(params) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_XuatLe_YeuCau', sql.BigInt, params.idYeuCau);
    req.input('ID_HinhThucXuatVT', sql.TinyInt, params.idHinhThucXuatVT);
    req.input('ID_KhoXuat', sql.SmallInt, params.idKhoXuat);
    req.input('ID_LuongQT', sql.SmallInt, params.idLuongQT || 2);
    req.input('ID_KhoNhap', sql.SmallInt, params.idKhoNhap || null);
    req.input('NguoiNhanHang', sql.NVarChar(255), params.nguoiNhanHang || null);
    req.input('NoiDen', sql.NVarChar(255), params.noiDen || null);
    req.input('LyDoXuat', sql.NVarChar(255), params.lyDoXuat || null);
    req.input('GhiChu', sql.NVarChar(500), params.ghiChu || null);
    req.input('TaiKhoan', sql.SmallInt, params.taiKhoan);
    req.input('ChiTietJson', sql.NVarChar(sql.MAX), JSON.stringify(params.chiTiet || []));

    const result = await req.execute('dbo.usp_XuatLe_CreateLenhXuatVT');
    return result.recordset[0];
  },

  /**
   * Lấy danh sách lệnh xuất theo yêu cầu.
   * SP: usp_XuatLe_GetLenhXuatByYeuCau
   */
  async getLenhXuatByYeuCau(idYeuCau) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);

    const result = await req.execute('dbo.usp_XuatLe_GetLenhXuatByYeuCau');
    return result.recordset;
  },

  /**
   * Huỷ liên kết lệnh xuất.
   * SP: usp_XuatLe_UnlinkLenhXuatVT
   */
  async unlinkLenhXuat(idYeuCau, idLenhXuatVT, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);
    req.input('ID_LenhXuatVT', sql.Int, idLenhXuatVT);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_UnlinkLenhXuatVT');
    return result.recordset[0];
  },

  // ─── Phiếu xuất ──────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách phiếu xuất theo yêu cầu.
   * SP: usp_XuatLe_GetPhieuXuatByYeuCau
   */
  async getPhieuXuatByYeuCau(idYeuCau) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);

    const result = await req.execute('dbo.usp_XuatLe_GetPhieuXuatByYeuCau');
    return result.recordset;
  },

  /**
   * Chi tiết phiếu xuất (danh sách vật tư xuất).
   * SP: usp_XuatLe_GetPhieuXuatDetailByPhieu
   */
  async getPhieuXuatDetail(idPhieuXuatVT) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_PhieuXuatVT', sql.Int, idPhieuXuatVT);

    const result = await req.execute('dbo.usp_XuatLe_GetPhieuXuatDetailByPhieu');
    return result.recordset;
  },

  /**
   * Đồng bộ phiếu xuất từ ERP về hệ thống.
   * SP: usp_XuatLe_Sync_PhieuXuat_FromERP
   */
  async syncPhieuXuat(idYeuCau = null) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau || null);

    const result = await req.execute('dbo.usp_XuatLe_Sync_PhieuXuat_FromERP');
    return result.recordset[0];
  },

  // ─── Phiếu nhập ──────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách phiếu nhập theo yêu cầu.
   * SP: usp_XuatLe_GetPhieuNhapByYeuCau
   */
  async getPhieuNhapByYeuCau(idYeuCau) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);

    const result = await req.execute('dbo.usp_XuatLe_GetPhieuNhapByYeuCau');
    return result.recordset;
  },

  /**
   * Chi tiết phiếu nhập.
   * SP: usp_XuatLe_GetPhieuNhapDetailByPhieu
   */
  async getPhieuNhapDetail(idPhieuNhapVT) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_PhieuNhapVT', sql.Int, idPhieuNhapVT);

    const result = await req.execute('dbo.usp_XuatLe_GetPhieuNhapDetailByPhieu');
    return result.recordset;
  },

  /**
   * Đồng bộ phiếu nhập từ ERP.
   * SP: usp_XuatLe_Sync_PhieuNhap_FromERP
   */
  async syncPhieuNhap(idYeuCau = null) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau || null);

    const result = await req.execute('dbo.usp_XuatLe_Sync_PhieuNhap_FromERP');
    return result.recordset[0];
  },
};

module.exports = lenhXuatRepository;
