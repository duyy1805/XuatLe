'use strict';

const router = require('express').Router();
const auth = require('../middleware/auth');

const authRoutes = require('./auth.routes');
const dmRoutes = require('./dm.routes');
const sourceRoutes = require('./source.routes');
const yeuCauRoutes = require('./yeuCau.routes');
const phieuRoutes = require('./phieu.routes');
const reportRoutes = require('./report.routes');

// ─── Public routes (không cần auth) ────────────────────────────────────────────
router.use('/auth', authRoutes);

// Áp dụng auth middleware cho tất cả routes phía dưới
router.use(auth);

// ─── Sub-routes ────────────────────────────────────────────────────────────────
// Danh mục
router.use('/dm', dmRoutes);

// Nguồn dữ liệu (kế hoạch, vật tư)
router.use('/source', sourceRoutes);

// Yêu cầu xuất lẻ (core)
router.use('/yeu-cau', yeuCauRoutes);

// Chi tiết phiếu xuất / nhập (theo ID phiếu, không thuộc yêu cầu)
router.use('/phieu', phieuRoutes);

// Dashboard
router.get('/dashboard', require('../controllers/reportController').getDashboard);

// Báo cáo
router.use('/report', reportRoutes);

module.exports = router;
