'use strict';

const router = require('express').Router();
const lenhXuatCtrl = require('../controllers/lenhXuatController');

// GET /api/phieu-xuat/:idPhieu/chi-tiet
router.get('/xuat/:idPhieu/chi-tiet', lenhXuatCtrl.getPhieuXuatDetail);

// GET /api/phieu-nhap/:idPhieu/chi-tiet
router.get('/nhap/:idPhieu/chi-tiet', lenhXuatCtrl.getPhieuNhapDetail);

module.exports = router;
