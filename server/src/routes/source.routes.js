'use strict';

const router = require('express').Router();
const sourceCtrl = require('../controllers/sourceController');

// GET /api/source/ke-hoach  →  Danh sách kế hoạch sản xuất
router.get('/ke-hoach', sourceCtrl.getKeHoachList);

// GET /api/source/vat-tu?idKeHoachSanXuat=&idDonHangSanPham=  →  Vật tư theo kế hoạch
router.get('/vat-tu', sourceCtrl.getVatTuByKeHoach);

// GET /api/source/vat-tu-phoi →  Vật tư phôi
router.get('/vat-tu-phoi', sourceCtrl.getVatTuPhoi);

// GET /api/source/da-mo-phoi →  Đã mở phôi theo kế hoạch
router.get('/da-mo-phoi', sourceCtrl.getDaMoPhoi);

// GET /api/source/phieu-nhap-btp →  Danh sách Phiếu nhập BTP
router.get('/phieu-nhap-btp', sourceCtrl.getPhieuNhapBTP);

module.exports = router;
