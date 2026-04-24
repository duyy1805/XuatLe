'use strict';

const router = require('express').Router();
const congDoanLeCtrl = require('../controllers/congDoanLeController');
const dmCtrl = require('../controllers/dmController');

// ─── Danh mục công đoạn lẻ ────────────────────────────────────────────────────
router.get('/cong-doan-le', congDoanLeCtrl.getList);
router.post('/cong-doan-le', congDoanLeCtrl.save);
router.put('/cong-doan-le/:id', congDoanLeCtrl.save);
router.delete('/cong-doan-le/:id', congDoanLeCtrl.delete);

// ─── Kho ──────────────────────────────────────────────────────────────────────
router.get('/kho', dmCtrl.getKhoList);

// ─── Nhà cung cấp ─────────────────────────────────────────────────────────────
router.get('/nha-cung-cap', dmCtrl.getNhaCungCapList);

module.exports = router;
