'use strict';

const { getPool, sql } = require('../config/db');

const authRepository = {
  /**
   * Xác thực đăng nhập.
   * SP: usp_XuatLe_Login
   * @param {string} tenDangNhap
   * @param {string} matKhauMD5 - Mật khẩu đã hash MD5
   */
  async login(tenDangNhap, matKhauMD5) {
    const pool = getPool();
    const req = pool.request();
    req.input('TenDangNhap', sql.NVarChar(50), tenDangNhap);
    req.input('MatKhau_MD5', sql.NVarChar(32), matKhauMD5);

    const result = await req.execute('dbo.usp_XuatLe_Login');
    return result.recordset[0];
  },
};

module.exports = authRepository;
