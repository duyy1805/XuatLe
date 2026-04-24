# MÔ TẢ CHI TIẾT NGHIỆP VỤ MODULE XUẤT LẺ CÔNG ĐOẠN NGOÀI

## 1. Bối cảnh nghiệp vụ

Trong quy trình sản xuất thực tế tại nhà máy, một số công đoạn không được thực hiện nội bộ mà phải thuê ngoài (outsourcing), ví dụ: in, thêu, xử lý bề mặt, gia công đặc biệt. Khi đó, bán thành phẩm (BTP) sẽ được xuất khỏi kho để chuyển đến đơn vị gia công, sau đó nhận lại để tiếp tục sản xuất.

Hệ thống cần quản lý toàn bộ vòng đời của quá trình này nhằm đảm bảo kiểm soát vật tư, tiến độ và hao hụt.

---

## 2. Mục tiêu hệ thống

* Quản lý yêu cầu xuất lẻ vật tư/bán thành phẩm ra ngoài
* Theo dõi trạng thái xử lý từ lúc tạo yêu cầu đến khi hoàn thành
* Đồng bộ dữ liệu với hệ thống ERP (xuất kho, nhập kho)
* Kiểm soát số lượng xuất – nhập – hao hụt
* Cho phép đối soát và phát hiện sai lệch

---

## 3. Thành phần dữ liệu chính

### 3.1 Dữ liệu nguồn từ ERP

* Kế hoạch sản xuất (KeHoachSanXuat)
* Lệnh sản xuất (LenhSanXuat)
* Đơn hàng (DonHang)
* Sản phẩm trong đơn hàng (DonHang_SanPham)
* Vật tư theo đơn hàng (DonHang_VatTu)

=> Đây là dữ liệu đầu vào để xác định nhu cầu xuất lẻ

---

### 3.2 Danh mục công đoạn lẻ

Bảng: DM_CongDoanLe

Mỗi công đoạn có cấu hình:

* Loại đối tác (nội bộ / nhà cung cấp)
* Có xuất kho hay không
* Có nhập lại hay không
* Có cho phép hao hụt hay không
* Tỷ lệ hao hụt tối đa

---

### 3.3 Yêu cầu xuất lẻ (trung tâm hệ thống)

Bảng:

* XuatLe_YeuCau (header)
* XuatLe_YeuCau_ChiTiet (detail)

Mỗi yêu cầu gồm:

* Thông tin kế hoạch, đơn hàng, công đoạn
* Nhà cung cấp (nếu gia công ngoài)
* Ngày yêu cầu, ngày dự kiến xuất, deadline
* Danh sách vật tư và số lượng đề nghị xuất

---

## 4. Luồng xử lý nghiệp vụ

### Bước 1: Lấy dữ liệu nguồn

Người dùng chọn:

* Kế hoạch sản xuất
* Sản phẩm
* Công đoạn lẻ

Hệ thống tự động:

* Lấy danh sách vật tư liên quan
* Hiển thị số lượng kế hoạch

---

### Bước 2: Tạo yêu cầu xuất lẻ (Draft)

Người dùng nhập:

* Nhà cung cấp
* Số lượng đề nghị xuất
* Deadline
* Ghi chú

Hệ thống gọi:

* usp_XuatLe_YeuCau_SaveDraft_Json

Trạng thái:

* DRAFT (nháp)

---

### Bước 3: Gửi duyệt (Submit)

Người dùng submit yêu cầu

Hệ thống:

* Kiểm tra dữ liệu hợp lệ
* Chuyển trạng thái sang WAIT_APPROVE

---

### Bước 4: Phê duyệt (Approve)

Người có thẩm quyền:

* Duyệt hoặc từ chối

Nếu duyệt:

* Trạng thái → APPROVED

---

### Bước 5: Tạo lệnh xuất vật tư

Hệ thống tạo lệnh xuất trong ERP thông qua:

* usp_XuatLe_CreateLenhXuatVT

Sinh:

* LenhXuatVT

Trạng thái:

* Đã tạo lệnh xuất

---

### Bước 6: Xuất kho (ERP)

ERP thực hiện:

* Tạo Phiếu xuất vật tư (PhieuXuatVT)

Hệ thống:

* Sync về qua usp_XuatLe_Sync_PhieuXuat

Trạng thái:

* Đã xuất kho

---

### Bước 7: Nhập lại sau gia công

Sau khi gia công xong:

* ERP tạo Phiếu nhập (PhieuNhapVT)

Hệ thống:

* Sync qua usp_XuatLe_Sync_PhieuNhap

Trạng thái:

* Đã nhập kho

---

### Bước 8: Đối soát

Hệ thống tính toán:

* Tổng xuất
* Tổng nhập
* Hao hụt = Xuất - Nhập

Kiểm tra:

* Hao hụt có vượt tỷ lệ cho phép không

Kết quả:

* Nếu hợp lệ → COMPLETED
* Nếu lệch → CHENH_LECH

---

## 5. Đặc điểm nghiệp vụ quan trọng

### 5.1 Xuất nhiều lần

Một yêu cầu có thể được xuất nhiều đợt:

* Mỗi đợt tương ứng một phiếu xuất

---

### 5.2 Nhập nhiều lần

Có thể nhập lại nhiều lần:

* Phù hợp với thực tế gia công chia lô

---

### 5.3 Hao hụt vật tư

Hệ thống cho phép:

* Khai báo hao hụt
* Giới hạn theo tỷ lệ cấu hình

---

### 5.4 Đối soát tự động

So sánh:

* Tổng xuất vs tổng nhập

Phát hiện:

* Thiếu hàng
* Dư hàng
* Sai lệch bất thường

---

## 6. Trạng thái vòng đời

* 0: Nháp
* 1: Chờ duyệt
* 2: Đã duyệt
* 3: Đã tạo lệnh xuất
* 4: Đã xuất kho
* 5: Đã nhập kho
* 6: Nhập một phần
* 7: Xuất một phần
* 8: Chênh lệch
* 9: Hoàn thành
* 10: Hủy

---

## 7. Giá trị mang lại

* Kiểm soát chặt chẽ vật tư khi gia công ngoài
* Giảm thất thoát và sai lệch
* Theo dõi tiến độ theo từng công đoạn
* Tích hợp chặt với ERP
* Hỗ trợ audit và truy vết lịch sử

---

## 8. Tổng kết

Module này đóng vai trò cầu nối giữa:

* kế hoạch sản xuất nội bộ
* hoạt động gia công bên ngoài
* và hệ thống ERP

Toàn bộ quy trình được kiểm soát xuyên suốt từ lúc xuất vật tư cho đến khi nhập lại và đối soát hoàn tất.
