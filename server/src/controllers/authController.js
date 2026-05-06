'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/authRepository');
const { sendSuccess, sendError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'xuatle-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authController = {
  /**
   * POST /api/auth/login
   * Body: { tenDangNhap, matKhau }
   */
  async login(req, res, next) {
    try {
      const { tenDangNhap, matKhau } = req.body;

      if (!tenDangNhap || !matKhau) {
        return sendError(res, 'Vui lòng nhập tên đăng nhập và mật khẩu.');
      }

      // Hash password with MD5
      const matKhauMD5 = crypto
        .createHash('md5')
        .update(matKhau)
        .digest('hex')
        .toUpperCase();
      console.log(tenDangNhap, matKhau);
      const result = await authRepo.login(tenDangNhap, matKhauMD5);

      if (!result || result.Code !== 0) {
        return sendError(res, result?.Message || 'Tên đăng nhập hoặc mật khẩu không đúng.', 401);
      }

      // Create JWT token
      const payload = {
        id: result.ID_TaiKhoanDangNhap,
        tenDangNhap: result.TenDangNhap,
        tenDayDu: result.TenDayDu,
        idDonVi: result.ID_DonVi,
        idBoPhan: result.ID_BoPhan,
        isAdmin: result.ID_TaiKhoanDangNhap === 1 || result.TenDangNhap.toLowerCase() === 'admin',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return sendSuccess(res, {
        token,
        user: payload,
      }, 'Đăng nhập thành công.');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
