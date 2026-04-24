# XuatLe API Server

API Node.js cho module **Xuất Lẻ Công Đoạn Ngoài** — quản lý toàn bộ vòng đời xuất vật tư ra ngoài gia công và nhập lại.

---

## Cài đặt

```bash
cd server
npm install
cp .env.example .env   # Điền thông tin DB vào .env
npm run dev            # Chạy dev (nodemon)
npm start              # Chạy production
```

---

## Cấu trúc thư mục

```
server/
├── src/
│   ├── app.js                    # Entry point
│   ├── config/
│   │   └── db.js                 # Kết nối SQL Server (mssql pool)
│   ├── middleware/
│   │   ├── auth.js               # Lấy TaiKhoan từ header x-tai-khoan
│   │   └── errorHandler.js       # Global error handler
│   ├── repositories/             # Gọi Stored Procedures
│   │   ├── congDoanLeRepository.js
│   │   ├── khoRepository.js
│   │   ├── nhaCungCapRepository.js
│   │   ├── sourceRepository.js
│   │   ├── yeuCauRepository.js
│   │   ├── lenhXuatRepository.js
│   │   ├── doiSoatRepository.js
│   │   └── reportRepository.js
│   ├── controllers/              # Business logic tầng HTTP
│   │   ├── congDoanLeController.js
│   │   ├── dmController.js
│   │   ├── sourceController.js
│   │   ├── yeuCauController.js
│   │   ├── lenhXuatController.js
│   │   ├── doiSoatController.js
│   │   └── reportController.js
│   ├── routes/                   # Express Router
│   │   ├── index.js
│   │   ├── dm.routes.js
│   │   ├── source.routes.js
│   │   ├── yeuCau.routes.js
│   │   ├── phieu.routes.js
│   │   └── report.routes.js
│   └── utils/
│       └── response.js           # Helper sendSuccess / sendError
├── .env.example
├── .gitignore
└── package.json
```

---

## Biến môi trường (.env)

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `PORT` | `3000` | Cổng server |
| `DB_SERVER` | `localhost` | SQL Server host |
| `DB_PORT` | `1433` | SQL Server port |
| `DB_NAME` | `TAG_QLSX` | Tên database |
| `DB_USER` | `sa` | Username |
| `DB_PASSWORD` | *(bắt buộc)* | Password |
| `DB_ENCRYPT` | `false` | Mã hoá kết nối |
| `DEFAULT_TAI_KHOAN` | `1` | ID tài khoản mặc định (dev) |

---

## Authentication

Truyền header `x-tai-khoan: <id>` với mỗi request để xác định người thực hiện.

---

## API Endpoints

### Base URL: `http://localhost:3000/api`

---

### 1. Danh mục (DM)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/dm/cong-doan-le` | Danh sách công đoạn lẻ |
| POST | `/dm/cong-doan-le` | Tạo mới công đoạn lẻ |
| PUT | `/dm/cong-doan-le/:id` | Cập nhật công đoạn lẻ |
| DELETE | `/dm/cong-doan-le/:id` | Xoá mềm công đoạn lẻ |
| GET | `/dm/kho` | Danh sách kho |
| GET | `/dm/nha-cung-cap` | Danh sách nhà cung cấp |

---

### 2. Nguồn dữ liệu (Source)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/source/ke-hoach` | Danh sách kế hoạch sản xuất |
| GET | `/source/vat-tu?idKeHoachSanXuat=&idDonHangSanPham=` | Vật tư theo kế hoạch |

---

### 3. Yêu cầu xuất lẻ (Vòng đời)

| Method | Endpoint | SP gọi | Mô tả |
|--------|----------|--------|-------|
| GET | `/yeu-cau` | `usp_XuatLe_YeuCau_GetList` | Danh sách yêu cầu |
| GET | `/yeu-cau/:id` | `usp_XuatLe_YeuCau_GetByID` | Chi tiết yêu cầu |
| GET | `/yeu-cau/:id/history` | `usp_XuatLe_YeuCau_GetHistory` | Lịch sử trạng thái |
| POST | `/yeu-cau/draft` | `usp_XuatLe_YeuCau_SaveDraft_Json` | Tạo mới DRAFT |
| PUT | `/yeu-cau/draft/:id` | `usp_XuatLe_YeuCau_SaveDraft_Json` | Cập nhật DRAFT |
| POST | `/yeu-cau/:id/submit` | `usp_XuatLe_YeuCau_Submit` | Trình duyệt |
| POST | `/yeu-cau/:id/approve` | `usp_XuatLe_YeuCau_Approve` | Phê duyệt / Từ chối |
| POST | `/yeu-cau/:id/cancel` | `usp_XuatLe_YeuCau_Cancel` | Huỷ |
| POST | `/yeu-cau/:id/close` | `usp_XuatLe_CloseYeuCau` | Đóng / Hoàn thành |

---

### 4. Lệnh xuất & Đồng bộ ERP

| Method | Endpoint | SP gọi | Mô tả |
|--------|----------|--------|-------|
| GET | `/yeu-cau/:id/lenh-xuat` | `usp_XuatLe_GetLenhXuatByYeuCau` | DS lệnh xuất |
| POST | `/yeu-cau/:id/lenh-xuat` | `usp_XuatLe_CreateLenhXuatVT` | Tạo lệnh xuất trong ERP |
| DELETE | `/yeu-cau/:id/lenh-xuat/:idLenh` | `usp_XuatLe_UnlinkLenhXuatVT` | Huỷ liên kết |
| GET | `/yeu-cau/:id/phieu-xuat` | `usp_XuatLe_GetPhieuXuatByYeuCau` | DS phiếu xuất |
| POST | `/yeu-cau/:id/sync-xuat` | `usp_XuatLe_Sync_PhieuXuat_FromERP` | Sync phiếu xuất từ ERP |
| GET | `/yeu-cau/:id/phieu-nhap` | `usp_XuatLe_GetPhieuNhapByYeuCau` | DS phiếu nhập |
| POST | `/yeu-cau/:id/sync-nhap` | `usp_XuatLe_Sync_PhieuNhap_FromERP` | Sync phiếu nhập từ ERP |
| GET | `/phieu/xuat/:idPhieu/chi-tiet` | `usp_XuatLe_GetPhieuXuatDetailByPhieu` | Chi tiết phiếu xuất |
| GET | `/phieu/nhap/:idPhieu/chi-tiet` | `usp_XuatLe_GetPhieuNhapDetailByPhieu` | Chi tiết phiếu nhập |

---

### 5. Đối soát & Hao hụt

| Method | Endpoint | SP gọi | Mô tả |
|--------|----------|--------|-------|
| GET | `/yeu-cau/:id/doi-soat/phieu-xuat` | `usp_XuatLe_DoiSoat_PhieuXuat` | Đối soát đề nghị vs xuất |
| GET | `/yeu-cau/:id/doi-soat/xuat-nhap` | `usp_XuatLe_DoiSoat_XuatNhap` | Đối soát xuất – nhập |
| PUT | `/yeu-cau/:id/hao-hut` | `usp_XuatLe_UpdateHaoHut` | Cập nhật hao hụt |

---

### 6. Dashboard & Báo cáo

| Method | Endpoint | SP gọi | Mô tả |
|--------|----------|--------|-------|
| GET | `/dashboard` | `usp_XuatLe_Dashboard_Summary` | Tổng quan nhanh |
| GET | `/report/tong-hop` | `usp_XuatLe_Report_TongHop` | Báo cáo tổng hợp |
| GET | `/report/doi-soat` | `usp_XuatLe_Report_DoiSoat` | Báo cáo đối soát |
| GET | `/report/ton-treo` | `usp_XuatLe_Report_TonTreo` | Báo cáo tồn treo |

---

## Trạng thái yêu cầu

| Code | Tên | Mô tả |
|------|-----|-------|
| 0 | DRAFT | Nháp |
| 1 | WAIT_APPROVE | Chờ duyệt |
| 2 | APPROVED | Đã duyệt |
| 3 | LENH_XUAT_CREATED | Đã tạo lệnh xuất |
| 4 | DA_XUAT_MOT_PHAN | Xuất một phần |
| 5 | DA_XUAT_DU | Đã xuất đủ |
| 6 | DA_NHAP_MOT_PHAN | Nhập một phần |
| 7 | COMPLETED | Hoàn thành |
| 8 | CHENH_LECH | Chênh lệch / Quá hạn |
| 9 | CANCELLED | Đã huỷ |

---

## Ví dụ Request

### Tạo yêu cầu DRAFT

```http
POST /api/yeu-cau/draft
x-tai-khoan: 1
Content-Type: application/json

{
  "idLenhSanXuat": 6,
  "idKeHoachSanXuat": 2,
  "idDonHang": 1,
  "idDonHangSanPham": 5,
  "idCongDoanLe": 3,
  "idBoPhanNguon": 3,
  "idNhaCungCap": 1,
  "ngayYeuCau": "2026-04-24",
  "ngayDuKienXuat": "2026-04-25",
  "deadlineHoanThanh": "2026-04-30",
  "ghiChu": "Xuất lẻ in ngoài",
  "chiTiet": [
    {
      "idDong": 1,
      "idDonHangVatTu": 1,
      "idVatTuXuat": 2,
      "idVatTuNhap": 2,
      "idDonViTinh": 7,
      "soLuongKeHoach": 100,
      "soLuongDeNghiXuat": 50,
      "donGiaTamTinh": null,
      "ghiChu": null
    }
  ]
}
```

### Phê duyệt

```http
POST /api/yeu-cau/3/approve
x-tai-khoan: 1
Content-Type: application/json

{ "isApprove": true }
```
