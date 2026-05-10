# MÔ TẢ CHI TIẾT NGHIỆP VỤ MODULE XUẤT LẺ CÔNG ĐOẠN NGOÀI (CẬP NHẬT)

## 1. Bối cảnh nghiệp vụ

Trong quy trình sản xuất, các công đoạn gia công ngoài (outsourcing) yêu cầu xuất vật tư/bán thành phẩm từ kho nhà máy sang đơn vị gia công và nhận lại sau khi hoàn tất. 

Quy trình mới tập trung vào việc **vận hành trực tiếp trên phần mềm QLCĐCL** và **tự động đồng bộ hai chiều với ERP** để đảm bảo tính chính xác, truy xuất nguồn gốc và giảm thiểu nhập liệu thủ công.

---

## 2. Mục tiêu hệ thống

*   **Tận dụng dữ liệu ERP:** Lấy thông tin từ Lệnh xuất vật tư đã có trên ERP.
*   **Vận hành tập trung:** Thủ kho và SXBT thao tác chính trên phần mềm QLCĐCL.
*   **Truy xuất nguồn gốc:** Kết nối thông tin phiếu xuất với đích danh phiếu nhập BTP nguồn.
*   **Đồng bộ tức thời:** Tự động sinh phiếu tương ứng trên ERP ngay khi thao tác trên Web thành công.

---

## 3. Thành phần dữ liệu chính

### 3.1 Dữ liệu nguồn từ ERP
*   **Lệnh xuất vật tư** (`LenhXuatVT`): Chứa thông tin chung về việc xuất kho.
*   **Chi tiết vật tư lệnh xuất** (`LenhXuatVT_VatTu`): Danh sách vật tư và số lượng cần xuất.
*   **Phiếu nhập BTP** (`PhieuNhapBTP`): Dùng để chọn nguồn gốc cho vật tư khi xuất kho (Traceability).

### 3.2 Dữ liệu tại QLCĐCL
*   **Yêu cầu xuất lẻ** (`XuatLe_YeuCau`): Lưu vết lệnh xuất và trạng thái thực hiện.
*   **Bảng Map dữ liệu:** Liên kết ID giữa hai hệ thống (`XuatLe_PhieuXuat_Map`, `XuatLe_PhieuNhap_Map`).

---

## 4. Luồng xử lý nghiệp vụ thực tế

### Bước 1: Khởi tạo yêu cầu (Từ Lệnh ERP)
Người dùng tạo yêu cầu trên Web bằng cách **chọn một Lệnh xuất vật tư (LXVT)** đã có trên ERP.
*   Hệ thống tự động tải danh sách vật tư từ ERP sang.
*   Người dùng bổ sung thông tin: Công đoạn lẻ, Nhà cung cấp, Deadline.
*   **Trạng thái:** `2 - Chờ tạo lệnh ERP` (Tự động chuyển sang trạng thái này vì lệnh đã có sẵn trên ERP).

### Bước 2: Thủ kho thực hiện Xuất kho
Thủ kho mở yêu cầu trên Web và tiến hành lập phiếu xuất.
*   **Tính năng đặc biệt:** Cho phép chọn đích danh **Phiếu nhập BTP** nào để xuất (phục vụ truy xuất).
*   Khi bấm "Lưu phiếu", hệ thống thực hiện:
    1.  Lưu thông tin vào QLCĐCL.
    2.  **Tự động gọi API/Proc đẩy sang ERP** để sinh ra một Phiếu xuất kho (`PhieuXuatVT`) tương ứng.
*   **Trạng thái:** `4 - Đang xuất kho` hoặc `5 - Đã xuất đủ`.

### Bước 3: SXBT ghi nhận hoàn thành (Nhập kho)
Sau khi gia công xong, nhân viên SXBT thực hiện nhập lại hàng ngay trên giao diện Web.
*   Bấm nút **"Nhập kho"** và điền số lượng thực tế nhận về.
*   Hệ thống thực hiện:
    1.  Lưu thông tin vào QLCĐCL.
    2.  **Tự động đẩy thông tin về ERP** để sinh ra một Phiếu nhập kho (`PhieuNhapVT`) hoàn chỉnh.
*   **Trạng thái:** `6 - Đang nhập lại` hoặc `7 - Hoàn thành`.

---

## 5. Cơ chế đồng bộ và Kiểm soát

### 5.1 Đồng bộ hai chiều (Bi-directional Sync)
*   **Chiều ERP -> Web:** Lấy thông tin lệnh xuất ban đầu.
*   **Chiều Web -> ERP:** Tự động sinh phiếu Xuất/Nhập ngay khi thao tác trên Web để số liệu kho luôn khớp.

### 5.2 Truy xuất nguồn gốc (Traceability)
Việc chọn phiếu nhập BTP nguồn khi xuất giúp hệ thống biết chính xác lô hàng nào đã được mang đi gia công, từ đó đồng bộ dữ liệu báo cáo sau khi in.

---

## 6. Tổng kết lợi ích

1.  **Dữ liệu chính xác:** Không còn tình trạng lệch số liệu giữa hai hệ thống do nhập liệu hai lần.
2.  **Thao tác nhanh:** Thủ kho không cần chuyển đổi giữa nhiều phần mềm.
3.  **Quản lý trực quan:** Bộ phận SXBT theo dõi được tiến độ nhập/xuất của từng công đoạn lẻ ngay trên một giao diện duy nhất.
