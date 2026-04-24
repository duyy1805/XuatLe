'use strict';

const router = require('express').Router();
const sourceCtrl = require('../controllers/sourceController');

// GET /api/source/ke-hoach  →  Danh sách kế hoạch sản xuất
router.get('/ke-hoach', sourceCtrl.getKeHoachList);

// GET /api/source/vat-tu?idKeHoachSanXuat=&idDonHangSanPham=  →  Vật tư theo kế hoạch
router.get('/vat-tu', sourceCtrl.getVatTuByKeHoach);

module.exports = router;
