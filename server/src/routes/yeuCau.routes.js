'use strict';

const router = require('express').Router();
const yeuCauCtrl = require('../controllers/yeuCauController');
const lenhXuatCtrl = require('../controllers/lenhXuatController');
const doiSoatCtrl = require('../controllers/doiSoatController');

// ─── Danh sách và Chi tiết ────────────────────────────────────────────────────
router.get('/', yeuCauCtrl.getList);
router.get('/erp/lenh-xuat', yeuCauCtrl.getERPLenhXuatList);      // Danh sách lệnh ERP
router.get('/erp/lenh-xuat/:id/detail', yeuCauCtrl.getERPLenhXuatDetail); // Chi tiết vật tư ERP
router.get('/:id', yeuCauCtrl.getByID);
router.get('/:id/history', yeuCauCtrl.getHistory);

// ─── Vòng đời yêu cầu ────────────────────────────────────────────────────────
router.post('/draft', yeuCauCtrl.saveDraft);            // Tạo mới DRAFT
router.put('/draft/:id', yeuCauCtrl.saveDraft);         // Cập nhật DRAFT (id trong body)
router.post('/:id/submit', yeuCauCtrl.submit);          // Trình duyệt
router.post('/:id/approve', yeuCauCtrl.approve);        // Phê duyệt / Từ chối
router.post('/:id/cancel', yeuCauCtrl.cancel);          // Huỷ
router.post('/:id/close', yeuCauCtrl.close);            // Đóng / Hoàn thành
router.post('/:id/nhap-lai', yeuCauCtrl.nhapLai);       // Nhập lại vật tư

// ─── Lệnh xuất ───────────────────────────────────────────────────────────────
router.get('/:id/lenh-xuat', lenhXuatCtrl.getLenhXuat);
router.post('/:id/lenh-xuat', lenhXuatCtrl.createLenhXuat);
router.delete('/:id/lenh-xuat/:idLenh', lenhXuatCtrl.unlinkLenhXuat);

// ─── Phiếu xuất (theo yêu cầu) ───────────────────────────────────────────────
router.get('/:id/phieu-xuat', lenhXuatCtrl.getPhieuXuat);
router.get('/phieu-xuat/:idPhieu', lenhXuatCtrl.getPhieuXuatDetail);
router.post('/:id/xuat-kho', yeuCauCtrl.xuatKho);            // Xuất kho và Sync ERP (MỚI)
router.post('/:id/sync-xuat', lenhXuatCtrl.syncPhieuXuat);

// ─── Phiếu nhập (theo yêu cầu) ───────────────────────────────────────────────
router.get('/:id/phieu-nhap', lenhXuatCtrl.getPhieuNhap);
router.get('/phieu-nhap/:idPhieu', lenhXuatCtrl.getPhieuNhapDetail);
router.post('/:id/sync-nhap', lenhXuatCtrl.syncPhieuNhap);

// ─── Đối soát ────────────────────────────────────────────────────────────────
router.get('/:id/doi-soat/phieu-xuat', doiSoatCtrl.doiSoatPhieuXuat);
router.get('/:id/doi-soat/xuat-nhap', doiSoatCtrl.doiSoatXuatNhap);

// ─── Hao hụt ─────────────────────────────────────────────────────────────────
router.put('/:id/hao-hut', doiSoatCtrl.updateHaoHut);

// ─── Lịch sử nhập xuất vật tư ──────────────────────────────────────────────
router.get('/:id/item-history', yeuCauCtrl.getItemHistory);

module.exports = router;
