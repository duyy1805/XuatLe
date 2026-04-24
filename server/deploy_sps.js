const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    }
};

const newSaveDraft = `CREATE OR ALTER PROC [dbo].[usp_XuatLe_YeuCau_SaveDraft_Json]
    @ID_XuatLe_YeuCau BIGINT = NULL,
    @ID_CongDoanLe INT,
    @ID_BoPhan_Nguon SMALLINT,
    @ID_BoPhan_Nhan SMALLINT = NULL,
    @ID_NhaCungCap SMALLINT = NULL,
    @Ngay_YeuCau DATE,
    @Ngay_DuKienXuat DATE = NULL,
    @Deadline_HoanThanh DATE = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @ChiTietJson NVARCHAR(MAX),
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @So_YeuCau NVARCHAR(30),
        @TrangThai_Cu TINYINT = NULL,
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        IF ISNULL(@ChiTietJson, N'') = N''
            THROW 51001, N'Danh sach chi tiet khong duoc de trong.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.DM_CongDoanLe WHERE ID_CongDoanLe = @ID_CongDoanLe AND TonTai = 1)
            THROW 51002, N'Cong doan le khong ton tai.', 1;

        DECLARE @ChiTiet TABLE
        (
            ID_Dong INT NOT NULL,
            ID_LenhSanXuat INT,
            ID_KeHoachSanXuat INT,
            ID_DonHang INT,
            ID_DonHang_SanPham INT,
            ID_DonHang_LoSanXuat INT,
            ID_DonHang_VatTu INT NOT NULL,
            ID_VatTu_Xuat INT NOT NULL,
            ID_VatTu_Nhap INT NULL,
            ID_DonViTinh SMALLINT NOT NULL,
            SoLuong_KeHoach DECIMAL(18,2) NOT NULL,
            SoLuong_DeNghi_Xuat DECIMAL(18,2) NOT NULL,
            DonGiaTamTinh DECIMAL(18,4) NULL,
            GhiChu NVARCHAR(500) NULL
        );

        INSERT INTO @ChiTiet
        (
            ID_Dong,
            ID_LenhSanXuat,
            ID_KeHoachSanXuat,
            ID_DonHang,
            ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat,
            ID_DonHang_VatTu,
            ID_VatTu_Xuat,
            ID_VatTu_Nhap,
            ID_DonViTinh,
            SoLuong_KeHoach,
            SoLuong_DeNghi_Xuat,
            DonGiaTamTinh,
            GhiChu
        )
        SELECT
            ID_Dong,
            ID_LenhSanXuat,
            ID_KeHoachSanXuat,
            ID_DonHang,
            ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat,
            ID_DonHang_VatTu,
            ID_VatTu_Xuat,
            ID_VatTu_Nhap,
            ID_DonViTinh,
            SoLuong_KeHoach,
            SoLuong_DeNghi_Xuat,
            DonGiaTamTinh,
            GhiChu
        FROM OPENJSON(@ChiTietJson)
        WITH
        (
            ID_Dong INT '$.idDong',
            ID_LenhSanXuat INT '$.idLenhSanXuat',
            ID_KeHoachSanXuat INT '$.idKeHoachSanXuat',
            ID_DonHang INT '$.idDonHang',
            ID_DonHang_SanPham INT '$.idDonHangSanPham',
            ID_DonHang_LoSanXuat INT '$.idDonHangLoSanXuat',
            ID_DonHang_VatTu INT '$.idDonHangVatTu',
            ID_VatTu_Xuat INT '$.idVatTuXuat',
            ID_VatTu_Nhap INT '$.idVatTuNhap',
            ID_DonViTinh SMALLINT '$.idDonViTinh',
            SoLuong_KeHoach DECIMAL(18,2) '$.soLuongKeHoach',
            SoLuong_DeNghi_Xuat DECIMAL(18,2) '$.soLuongDeNghiXuat',
            DonGiaTamTinh DECIMAL(18,4) '$.donGiaTamTinh',
            GhiChu NVARCHAR(500) '$.ghiChu'
        );

        IF NOT EXISTS (SELECT 1 FROM @ChiTiet)
            THROW 51003, N'Danh sach chi tiet khong hop le.', 1;

        IF EXISTS(SELECT 1 FROM @ChiTiet WHERE ISNULL(SoLuong_DeNghi_Xuat,0) <= 0)
            THROW 51004, N'So luong de nghi xuat phai lon hon 0.', 1;

        BEGIN TRAN;

        IF @ID_XuatLe_YeuCau IS NULL
        BEGIN
            SET @So_YeuCau = N'XL' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 112), N'-', N'')
                         + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), N':', N'');

            INSERT INTO dbo.XuatLe_YeuCau
            (
                So_YeuCau,
                ID_CongDoanLe,
                ID_BoPhan_Nguon,
                ID_BoPhan_Nhan,
                ID_NhaCungCap,
                Ngay_YeuCau,
                Ngay_DuKienXuat,
                Deadline_HoanThanh,
                SoLuong_KeHoach,
                SoLuong_DeNghi_Xuat,
                SoLuong_DaXuat,
                SoLuong_DaNhap,
                SoLuong_HaoHut_Duyet,
                TrangThai,
                IsQuaHan,
                IsKhoa,
                GhiChu,
                TaiKhoan_Lap,
                Ngay_Lap,
                TaiKhoan_SuaCuoi,
                Ngay_SuaCuoi
            )
            SELECT
                @So_YeuCau,
                @ID_CongDoanLe,
                @ID_BoPhan_Nguon,
                @ID_BoPhan_Nhan,
                @ID_NhaCungCap,
                @Ngay_YeuCau,
                @Ngay_DuKienXuat,
                @Deadline_HoanThanh,
                SUM(SoLuong_KeHoach),
                SUM(SoLuong_DeNghi_Xuat),
                0,0,0,
                0,
                0,
                0,
                @GhiChu,
                @TaiKhoan,
                GETDATE(),
                @TaiKhoan,
                GETDATE()
            FROM @ChiTiet;

            SET @ID_XuatLe_YeuCau = SCOPE_IDENTITY();
            SET @NoiDungLog = N'Tao moi yeu cau xuat le (Nhom Ke Hoach).';
        END
        ELSE
        BEGIN
            SELECT @TrangThai_Cu = TrangThai,
                   @So_YeuCau = So_YeuCau
            FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

            IF @TrangThai_Cu IS NULL
                THROW 51006, N'Khong tim thay yeu cau.', 1;

            IF @TrangThai_Cu NOT IN (0)
                THROW 51007, N'Chi duoc sua o trang thai nhap.', 1;

            UPDATE dbo.XuatLe_YeuCau
            SET ID_CongDoanLe = @ID_CongDoanLe,
                ID_BoPhan_Nguon = @ID_BoPhan_Nguon,
                ID_BoPhan_Nhan = @ID_BoPhan_Nhan,
                ID_NhaCungCap = @ID_NhaCungCap,
                Ngay_YeuCau = @Ngay_YeuCau,
                Ngay_DuKienXuat = @Ngay_DuKienXuat,
                Deadline_HoanThanh = @Deadline_HoanThanh,
                SoLuong_KeHoach = (SELECT ISNULL(SUM(SoLuong_KeHoach),0) FROM @ChiTiet),
                SoLuong_DeNghi_Xuat = (SELECT ISNULL(SUM(SoLuong_DeNghi_Xuat),0) FROM @ChiTiet),
                GhiChu = @GhiChu,
                TaiKhoan_SuaCuoi = @TaiKhoan,
                Ngay_SuaCuoi = GETDATE()
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

            DELETE FROM dbo.XuatLe_YeuCau_ChiTiet
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

            SET @NoiDungLog = N'Cap nhat yeu cau xuat le o trang thai nhap.';
        END

        INSERT INTO dbo.XuatLe_YeuCau_ChiTiet
        (
            ID_XuatLe_YeuCau,
            ID_Dong,
            ID_LenhSanXuat,
            ID_KeHoachSanXuat,
            ID_DonHang,
            ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat,
            ID_DonHang_VatTu,
            ID_VatTu_Xuat,
            ID_VatTu_Nhap,
            ID_DonViTinh,
            SoLuong_KeHoach,
            SoLuong_DeNghi_Xuat,
            SoLuong_DaXuat,
            SoLuong_DaNhap,
            SoLuong_HaoHut_Duyet,
            DonGiaTamTinh,
            GhiChu
        )
        SELECT
            @ID_XuatLe_YeuCau,
            ID_Dong,
            ID_LenhSanXuat,
            ID_KeHoachSanXuat,
            ID_DonHang,
            ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat,
            ID_DonHang_VatTu,
            ID_VatTu_Xuat,
            ID_VatTu_Nhap,
            ID_DonViTinh,
            SoLuong_KeHoach,
            SoLuong_DeNghi_Xuat,
            0,
            0,
            0,
            DonGiaTamTinh,
            GhiChu
        FROM @ChiTiet;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 0,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau, @So_YeuCau AS So_YeuCau;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 
    -1 AS Code, 
    ERROR_MESSAGE() AS Message, 
    @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau,
    NULL AS So_YeuCau;
    END CATCH
END`;

const newGetById = `CREATE OR ALTER PROC [dbo].[usp_XuatLe_YeuCau_GetByID]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.usp_XuatLe_YeuCau_GetList
        @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

    SELECT
        CT.ID_XuatLe_YeuCau,
        CT.ID_Dong,
        CT.ID_LenhSanXuat,
        LSX.So_LenhSanXuat AS So_LenhSanXuat,
        CT.ID_KeHoachSanXuat,
        CT.ID_DonHang,
        CT.ID_DonHang_SanPham,
        CT.ID_DonHang_VatTu,
        DHVT.ID_VatTu,
        VT.Ma_VatTu,
        VT.QuyCach AS Ten_VatTu,
        CT.ID_VatTu_Xuat,
        VTX.Ma_VatTu AS Ma_VatTu_Xuat,
        VTX.QuyCach AS Ten_VatTu_Xuat,
        CT.ID_VatTu_Nhap,
        VTN.Ma_VatTu AS Ma_VatTu_Nhap,
        VTN.QuyCach AS Ten_VatTu_Nhap,
        CT.ID_DonViTinh,
        DVT.Ten_DonViTinh,
        CT.SoLuong_KeHoach,
        CT.SoLuong_DeNghi_Xuat,
        CT.SoLuong_DaXuat,
        CT.SoLuong_DaNhap,
        CT.SoLuong_HaoHut_Duyet,
        (CT.SoLuong_DaXuat - CT.SoLuong_DaNhap - CT.SoLuong_HaoHut_Duyet) AS SoLuong_DangTreo,
        CT.DonGiaTamTinh,
        CT.GhiChu
    FROM dbo.XuatLe_YeuCau_ChiTiet CT
    LEFT JOIN TAG_QTKD.dbo.DonHang_VatTu DHVT
        ON DHVT.ID_DonHang_VatTu = CT.ID_DonHang_VatTu
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
        ON VT.ID_VatTu = DHVT.ID_VatTu
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VTX
        ON VTX.ID_VatTu = CT.ID_VatTu_Xuat
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VTN
        ON VTN.ID_VatTu = CT.ID_VatTu_Nhap
    LEFT JOIN TAG_QTKD.dbo.DM_DonViTinh DVT
        ON DVT.ID_DonViTinh = CT.ID_DonViTinh
    LEFT JOIN TAG_QLSX.dbo.LenhSanXuat LSX
        ON LSX.ID_LenhSanXuat = CT.ID_LenhSanXuat
    WHERE CT.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY CT.ID_Dong;
END`;

const newGetList = `CREATE OR ALTER PROC [dbo].[usp_XuatLe_YeuCau_GetList]
    @ID_XuatLe_YeuCau BIGINT = NULL,
    @ID_CongDoanLe INT = NULL,
    @ID_NhaCungCap SMALLINT = NULL,
    @TrangThai TINYINT = NULL,
    @Keyword NVARCHAR(100) = NULL,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Y.ID_XuatLe_YeuCau,
        Y.So_YeuCau,
        Y.ID_CongDoanLe,
        CDL.Ma_CongDoanLe,
        CDL.Ten_CongDoanLe,
        Y.ID_BoPhan_Nguon,
        BPN.Ten_BoPhan AS Ten_BoPhan_Nguon,
        Y.ID_BoPhan_Nhan,
        BPR.Ten_BoPhan AS Ten_BoPhan_Nhan,
        Y.ID_NhaCungCap,
        NCC.Ten_NhaCungCap,
        Y.Ngay_YeuCau,
        Y.Ngay_DuKienXuat,
        Y.Deadline_HoanThanh,
        Y.SoLuong_KeHoach,
        Y.SoLuong_DeNghi_Xuat,
        Y.SoLuong_DaXuat,
        Y.SoLuong_DaNhap,
        Y.SoLuong_HaoHut_Duyet,
        (Y.SoLuong_DaXuat - Y.SoLuong_DaNhap - Y.SoLuong_HaoHut_Duyet) AS SoLuong_DangTreo,
        Y.TrangThai,
        Y.IsQuaHan,
        Y.IsKhoa,
        Y.GhiChu,
        Y.TaiKhoan_Lap,
        Y.Ngay_Lap,
        Y.TaiKhoan_Duyet,
        Y.Ngay_Duyet
    FROM dbo.XuatLe_YeuCau Y
    LEFT JOIN dbo.DM_CongDoanLe CDL
        ON CDL.ID_CongDoanLe = Y.ID_CongDoanLe
    LEFT JOIN TAG_System.dbo.DM_BoPhan BPN
        ON BPN.ID_BoPhan = Y.ID_BoPhan_Nguon
    LEFT JOIN TAG_System.dbo.DM_BoPhan BPR
        ON BPR.ID_BoPhan = Y.ID_BoPhan_Nhan
    LEFT JOIN TAG_QTKD.dbo.DM_NhaCungCap NCC
        ON NCC.ID_NhaCungCap = Y.ID_NhaCungCap
    WHERE (@ID_XuatLe_YeuCau IS NULL OR Y.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
      AND (@ID_CongDoanLe IS NULL OR Y.ID_CongDoanLe = @ID_CongDoanLe)
      AND (@ID_NhaCungCap IS NULL OR Y.ID_NhaCungCap = @ID_NhaCungCap)
      AND (@TrangThai IS NULL OR Y.TrangThai = @TrangThai)
      AND (@TuNgay IS NULL OR Y.Ngay_YeuCau >= @TuNgay)
      AND (@DenNgay IS NULL OR Y.Ngay_YeuCau <= @DenNgay)
      AND (
            @Keyword IS NULL
            OR Y.So_YeuCau LIKE N'%' + @Keyword + N'%'
            OR CDL.Ten_CongDoanLe LIKE N'%' + @Keyword + N'%'
          )
    ORDER BY Y.ID_XuatLe_YeuCau DESC;
END`;

async function run() {
    try {
        await sql.connect(config);
        console.log('Connected. Deploying SPs...');
        
        await sql.query(newSaveDraft);
        console.log('Deployed usp_XuatLe_YeuCau_SaveDraft_Json');

        await sql.query(newGetById);
        console.log('Deployed usp_XuatLe_YeuCau_GetByID');

        await sql.query(newGetList);
        console.log('Deployed usp_XuatLe_YeuCau_GetList');

    } catch (e) {
        console.error(e);
    } finally {
        sql.close();
    }
}

run();
