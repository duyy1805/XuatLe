'use strict';

const router = require('express').Router();
const reportCtrl = require('../controllers/reportController');

// GET /api/dashboard
router.get('/', reportCtrl.getDashboard);

// GET /api/report/tong-hop
router.get('/tong-hop', reportCtrl.reportTongHop);

// GET /api/report/doi-soat
router.get('/doi-soat', reportCtrl.reportDoiSoat);

// GET /api/report/ton-treo
router.get('/ton-treo', reportCtrl.reportTonTreo);

module.exports = router;
