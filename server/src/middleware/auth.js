'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xuatle-secret-key-2026';

/**
 * Auth middleware: xác thực JWT token từ header Authorization.
 * Fallback về DEFAULT_TAI_KHOAN nếu không có token (chế độ dev).
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.taiKhoan = decoded.id;
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
      });
    }
  }

  // Fallback: lấy từ header x-tai-khoan hoặc env (dev mode)
  const taiKhoan =
    parseInt(req.headers['x-tai-khoan'], 10) ||
    parseInt(process.env.DEFAULT_TAI_KHOAN, 10) ||
    1;
  req.taiKhoan = taiKhoan;
  next();
}

module.exports = authMiddleware;
