'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository cho Danh mục Công Đoạn Lẻ (DM_CongDoanLe).
 */
const congDoanLeRepository = {
  /**
   * Lấy danh sách công đoạn lẻ.
   * SP: usp_XuatLe_DM_CongDoanLe_GetList
   */
  async getList({ keyword, suDung, tonTai = 1 } = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('Keyword', sql.NVarChar(100), keyword || null);
    req.input('SuDung', sql.Bit, suDung != null ? suDung : null);
    req.input('TonTai', sql.Bit, tonTai != null ? tonTai : 1);

    const result = await req.execute('dbo.usp_XuatLe_DM_CongDoanLe_GetList');
    return result.recordset;
  },

  /**
   * Tạo mới hoặc cập nhật công đoạn lẻ.
   * SP: usp_XuatLe_DM_CongDoanLe_Save
   */
  async save(params) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_CongDoanLe', sql.Int, params.id || null);
    req.input('Ma_CongDoanLe', sql.NVarChar(20), params.maCongDoanLe);
    req.input('Ten_CongDoanLe', sql.NVarChar(200), params.tenCongDoanLe);
    req.input('Loai_DoiTac', sql.TinyInt, params.loaiDoiTac);
    req.input('CanXuatKho', sql.Bit, params.canXuatKho ?? 1);
    req.input('CanNhapLai', sql.Bit, params.canNhapLai ?? 1);
    req.input('ChoPhepNhapNhieuDot', sql.Bit, params.choPhepNhapNhieuDot ?? 1);
    req.input('ChoPhepXuatNhieuDot', sql.Bit, params.choPhepXuatNhieuDot ?? 1);
    req.input('ChoPhepHaoHut', sql.Bit, params.choPhepHaoHut ?? 0);
    req.input('TyLeHaoHutToiDa', sql.Decimal(9, 4), params.tyLeHaoHutToiDa || null);
    req.input('LeadTimeMacDinh_Ngay', sql.SmallInt, params.leadTimeMacDinhNgay || null);
    req.input('STT', sql.SmallInt, params.stt ?? 0);
    req.input('SuDung', sql.Bit, params.suDung ?? 1);
    req.input('GhiChu', sql.NVarChar(500), params.ghiChu || null);
    req.input('TaiKhoan', sql.SmallInt, params.taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_DM_CongDoanLe_Save');
    return result.recordset[0];
  },

  /**
   * Xoá mềm (soft-delete) công đoạn lẻ.
   * SP: usp_XuatLe_DM_CongDoanLe_Delete
   */
  async delete(id, taiKhoan) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_CongDoanLe', sql.Int, id);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_DM_CongDoanLe_Delete');
    return result.recordset[0];
  },
};

module.exports = congDoanLeRepository;
