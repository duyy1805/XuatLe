'use strict';

/**
 * Lấy TaiKhoan từ header x-tai-khoan hoặc fallback về DEFAULT_TAI_KHOAN.
 * Trong production bạn nên thay bằng JWT middleware thực sự.
 */
function authMiddleware(req, _res, next) {
  const taiKhoan =
    parseInt(req.headers['x-tai-khoan'], 10) ||
    parseInt(process.env.DEFAULT_TAI_KHOAN, 10) ||
    1;
  req.taiKhoan = taiKhoan;
  next();
}

module.exports = authMiddleware;
