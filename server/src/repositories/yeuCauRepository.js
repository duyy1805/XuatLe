'use strict';

const { getPool, sql } = require('../config/db');

/**
 * Repository chính cho YeuCau XuatLe.
 * Bao gồm toàn bộ vòng đời: Draft → Submit → Approve → CreateLenhXuat → Close/Cancel.
 */
const yeuCauRepository = {
  // ─── READ ────────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách yêu cầu xuất lẻ (có filter).
   * SP: usp_XuatLe_YeuCau_GetList
   */
  async getList(params = {}) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_XuatLe_YeuCau', sql.BigInt, params.id || null);
    req.input('ID_CongDoanLe', sql.Int, params.idCongDoanLe || null);
    req.input('ID_NhaCungCap', sql.SmallInt, params.idNhaCungCap || null);
    req.input('TrangThai', sql.TinyInt, params.trangThai != null ? params.trangThai : null);
    req.input('Keyword', sql.NVarChar(100), params.keyword || null);
    req.input('TuNgay', sql.Date, params.tuNgay || null);
    req.input('DenNgay', sql.Date, params.denNgay || null);
    req.input('TaiKhoan', sql.SmallInt, params.taiKhoan || null);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_GetList');
    return result.recordset;
  },

  /**
   * Lấy chi tiết 1 yêu cầu (header + detail lines).
   * SP: usp_XuatLe_YeuCau_GetByID  →  trả về 2 recordset
   */
  async getByID(id) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_GetByID');
    return {
      header: result.recordsets[0]?.[0] || null,
      chiTiet: result.recordsets[1] || [],
    };
  },

  /**
   * Lịch sử trạng thái.
   * SP: usp_XuatLe_YeuCau_GetHistory
   */
  async getHistory(id) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_GetHistory');
    return result.recordset;
  },

  // ─── WRITE ───────────────────────────────────────────────────────────────────

  /**
   * Tạo mới / cập nhật yêu cầu ở trạng thái DRAFT.
   * SP: usp_XuatLe_YeuCau_SaveDraft_Json
   * @param {object} params
   * @param {Array}  params.chiTiet  - mảng chi tiết vật tư
   */
  async saveDraft(params) {
    const pool = getPool();
    const req = pool.request();

    req.input('ID_XuatLe_YeuCau', sql.BigInt, params.id || null);
    req.input('ID_CongDoanLe', sql.Int, params.idCongDoanLe);
    req.input('ID_BoPhan_Nguon', sql.SmallInt, params.idBoPhanNguon);
    req.input('ID_BoPhan_Nhan', sql.SmallInt, params.idBoPhanNhan || null);
    req.input('ID_NhaCungCap', sql.SmallInt, params.idNhaCungCap || null);
    req.input('Ngay_YeuCau', sql.Date, params.ngayYeuCau);
    req.input('Ngay_DuKienXuat', sql.Date, params.ngayDuKienXuat || null);
    req.input('Deadline_HoanThanh', sql.Date, params.deadlineHoanThanh || null);
    req.input('GhiChu', sql.NVarChar(1000), params.ghiChu || null);
    req.input('ChiTietJson', sql.NVarChar(sql.MAX), JSON.stringify(params.chiTiet || []));
    req.input('TaiKhoan', sql.SmallInt, params.taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_SaveDraft_Json');
    return result.recordset[0];
  },

  /**
   * Trình duyệt yêu cầu (DRAFT → WAIT_APPROVE).
   * SP: usp_XuatLe_YeuCau_Submit
   */
  async submit(id, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_Submit');
    return result.recordset[0];
  },

  /**
   * Phê duyệt hoặc từ chối yêu cầu.
   * SP: usp_XuatLe_YeuCau_Approve
   * @param {boolean} isApprove
   */
  async approve(id, isApprove, lyDo, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);
    req.input('IsApprove', sql.Bit, isApprove ? 1 : 0);
    req.input('LyDo', sql.NVarChar(1000), lyDo || null);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_Approve');
    return result.recordset[0];
  },

  /**
   * Huỷ yêu cầu.
   * SP: usp_XuatLe_YeuCau_Cancel
   */
  async cancel(id, lyDo, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);
    req.input('LyDo', sql.NVarChar(1000), lyDo || null);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_Cancel');
    return result.recordset[0];
  },

  /**
   * Đóng yêu cầu (hoàn thành nghiệp vụ).
   * SP: usp_XuatLe_CloseYeuCau
   */
  async close(id, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_CloseYeuCau');
    return result.recordset[0];
  },

  /**
   * Nhập lại vật tư đã xuất.
   * SP: usp_XuatLe_YeuCau_NhapLai
   */
  async nhapLai(id, idKhoNhap, chiTiet, ghiChu, taiKhoan) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, id);
    req.input('ID_KhoNhap', sql.SmallInt, idKhoNhap);
    req.input('ID_HinhThucNhapVT', sql.TinyInt, 5); // Default to Nhập trả lại
    req.input('ChiTietJson', sql.NVarChar(sql.MAX), JSON.stringify(chiTiet || []));
    req.input('GhiChu', sql.NVarChar(1000), ghiChu || null);
    req.input('TaiKhoan', sql.SmallInt, taiKhoan);

    const result = await req.execute('dbo.usp_XuatLe_YeuCau_NhapLai');
    return result.recordset[0];
  },

  /**
   * Lịch sử nhập xuất của 1 vật tư trong yêu cầu.
   */
  async getItemReceiptHistory(idYeuCau, idVatTu, idDonHangVatTu) {
    const pool = getPool();
    const req = pool.request();
    req.input('ID_XuatLe_YeuCau', sql.BigInt, idYeuCau);
    req.input('ID_VatTu', sql.Int, idVatTu || null);
    req.input('ID_DonHang_VatTu', sql.Int, idDonHangVatTu || null);

    const result = await req.execute('dbo.usp_XuatLe_GetItemReceiptHistory');
    return result.recordset;
  },
};

module.exports = yeuCauRepository;
