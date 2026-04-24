USE [TAG_QLSX]
GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_CloseYeuCau]    Script Date: 23/04/2026 14:35:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_CloseYeuCau]
    @ID_XuatLe_YeuCau BIGINT,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @SLDangTreo DECIMAL(18,2),
            @TrangThai_Cu TINYINT;

    BEGIN TRY
        BEGIN TRAN;

        EXEC dbo.usp_XuatLe_YeuCau_RecalcSummary @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        SELECT
            @TrangThai_Cu = TrangThai,
            @SLDangTreo = SoLuong_DaXuat - SoLuong_DaNhap - SoLuong_HaoHut_Duyet
        FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF @TrangThai_Cu IS NULL
            THROW 58001, N'Khong tim thay yeu cau.', 1;

        IF ISNULL(@SLDangTreo,0) > 0
            THROW 58002, N'Yeu cau van con so luong dang treo, khong the dong.', 1;

        UPDATE dbo.XuatLe_YeuCau
        SET TrangThai = 7,
            TaiKhoan_SuaCuoi = @TaiKhoan,
            Ngay_SuaCuoi = GETDATE()
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 7,
            @NoiDung = N'Dong yeu cau xuat le.',
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_CreateLenhXuatVT]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_CreateLenhXuatVT]
    @ID_XuatLe_YeuCau BIGINT,
    @ID_HinhThucXuatVT TINYINT,
    @ID_KhoXuat SMALLINT,
    @ID_KhoNhap SMALLINT = NULL,
    @NguoiNhanHang NVARCHAR(255) = NULL,
    @NoiDen NVARCHAR(255) = NULL,
    @LyDoXuat NVARCHAR(255) = NULL,
    @GhiChu NVARCHAR(500) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @TrangThai_Cu TINYINT,
        @ID_NhaCungCap SMALLINT,
        @ID_BoPhan_Nguon SMALLINT,
        @ID_DonVi SMALLINT,
        @ID_KeHoachSanXuat INT,
        @ID_DonHang INT,
        @ID_LenhXuatVT INT,
        @So_LenhXuatVT NVARCHAR(20),
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @TrangThai_Cu = TrangThai,
            @ID_NhaCungCap = ID_NhaCungCap,
            @ID_BoPhan_Nguon = ID_BoPhan_Nguon,
            @ID_DonVi = ID_DonVi,
            @ID_KeHoachSanXuat = ID_KeHoachSanXuat,
            @ID_DonHang = ID_DonHang
        FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF @TrangThai_Cu IS NULL
            THROW 55001, N'Khong tim thay yeu cau.', 1;

        IF @TrangThai_Cu NOT IN (2,3,4)
            THROW 55002, N'Chi tao lenh xuat khi yeu cau da duyet.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.XuatLe_YeuCau_ChiTiet WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau AND SoLuong_DeNghi_Xuat > 0)
            THROW 55003, N'Khong co chi tiet de tao lenh xuat.', 1;

        SET @So_LenhXuatVT = N'XLX' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 112), N'-', N'')
                           + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), N':', N'');

        INSERT INTO TAG_QTKD.dbo.LenhXuatVT
        (
            ID_HinhThucXuatVT,
            So_LenhXuatVT,
            Ngay_LenhXuatVT,
            ID_KhachHang,
            ID_KhoXuat,
            ID_KhoNhap,
            ID_DonVi,
            ID_BoPhan,
            ID_KeHoachSanXuat,
            ID_NhaCungCap,
            LuongQT,
            NoiDen,
            NguoiNhanHang,
            LyDoXuat,
            GhiChu,
            TaiKhoan_Lap,
            Ngay_Lap,
            TaiKhoan_SuaCuoi,
            Ngay_SuaCuoi,
            TrangThai,
            TonTai
        )
        VALUES
        (
            @ID_HinhThucXuatVT,
            @So_LenhXuatVT,
            GETDATE(),
            0,
            @ID_KhoXuat,
            @ID_KhoNhap,
            @ID_DonVi,
            @ID_BoPhan_Nguon,
            @ID_KeHoachSanXuat,
            @ID_NhaCungCap,
            NULL,
            @NoiDen,
            @NguoiNhanHang,
            ISNULL(@LyDoXuat, N'Xuat le cong doan bo tro'),
            @GhiChu,
            @TaiKhoan,
            GETDATE(),
            @TaiKhoan,
            GETDATE(),
            0,
            1
        );

        SET @ID_LenhXuatVT = SCOPE_IDENTITY();

        INSERT INTO dbo.XuatLe_LenhXuat_Map
        (
            ID_XuatLe_YeuCau,
            ID_LenhXuatVT,
            So_LenhXuatVT,
            Ngay_LenhXuatVT,
            TrangThaiDongBo,
            GhiChu
        )
        VALUES
        (
            @ID_XuatLe_YeuCau,
            @ID_LenhXuatVT,
            @So_LenhXuatVT,
            GETDATE(),
            0,
            @GhiChu
        );

        UPDATE dbo.XuatLe_YeuCau
        SET TrangThai = 3,
            TaiKhoan_SuaCuoi = @TaiKhoan,
            Ngay_SuaCuoi = GETDATE()
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        SET @NoiDungLog = N'Tao lenh xuat vat tu. So lenh: ' + @So_LenhXuatVT;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 3,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_LenhXuatVT AS ID_LenhXuatVT, @So_LenhXuatVT AS So_LenhXuatVT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, CAST(NULL AS INT) AS ID_LenhXuatVT, CAST(NULL AS NVARCHAR(20)) AS So_LenhXuatVT;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Dashboard_Summary]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Dashboard_Summary]
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL,
    @ID_BoPhan SMALLINT = NULL,
    @ID_CongDoanLe INT = NULL,
    @ID_NhaCungCap SMALLINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TongYeuCau,
        SUM(CASE WHEN TrangThai NOT IN (7,9) THEN 1 ELSE 0 END) AS DangMo,
        SUM(CASE WHEN TrangThai = 8 THEN 1 ELSE 0 END) AS QuaHan,
        SUM(SoLuong_DeNghi_Xuat) AS TongSL_DeNghi,
        SUM(SoLuong_DaXuat) AS TongSL_DaXuat,
        SUM(SoLuong_DaNhap) AS TongSL_DaNhap,
        SUM(SoLuong_DaXuat - SoLuong_DaNhap - SoLuong_HaoHut_Duyet) AS TongSL_DangTreo
    FROM dbo.XuatLe_YeuCau
    WHERE (@TuNgay IS NULL OR Ngay_YeuCau >= @TuNgay)
      AND (@DenNgay IS NULL OR Ngay_YeuCau <= @DenNgay)
      AND (@ID_BoPhan IS NULL OR ID_BoPhan_Nguon = @ID_BoPhan)
      AND (@ID_CongDoanLe IS NULL OR ID_CongDoanLe = @ID_CongDoanLe)
      AND (@ID_NhaCungCap IS NULL OR ID_NhaCungCap = @ID_NhaCungCap);
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DM_CongDoanLe_Delete]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DM_CongDoanLe_Delete]
    @ID_CongDoanLe INT,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.DM_CongDoanLe
    SET TonTai = 0,
        SuDung = 0,
        TaiKhoan_SuaCuoi = @TaiKhoan,
        Ngay_SuaCuoi = GETDATE()
    WHERE ID_CongDoanLe = @ID_CongDoanLe;

    SELECT 0 AS Code, N'Thanh cong' AS Message;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DM_CongDoanLe_GetList]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DM_CongDoanLe_GetList]
    @Keyword NVARCHAR(100) = NULL,
    @SuDung BIT = NULL,
    @TonTai BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ID_CongDoanLe,
        Ma_CongDoanLe,
        Ten_CongDoanLe,
        Loai_DoiTac,
        CanXuatKho,
        CanNhapLai,
        ChoPhepNhapNhieuDot,
        ChoPhepXuatNhieuDot,
        ChoPhepHaoHut,
        TyLeHaoHutToiDa,
        LeadTimeMacDinh_Ngay,
        STT,
        SuDung,
        TonTai,
        GhiChu
    FROM dbo.DM_CongDoanLe
    WHERE (@TonTai IS NULL OR TonTai = @TonTai)
      AND (@SuDung IS NULL OR SuDung = @SuDung)
      AND (
            @Keyword IS NULL
            OR Ma_CongDoanLe LIKE N'%' + @Keyword + N'%'
            OR Ten_CongDoanLe LIKE N'%' + @Keyword + N'%'
          )
    ORDER BY STT, Ten_CongDoanLe;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DM_CongDoanLe_Save]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DM_CongDoanLe_Save]
    @ID_CongDoanLe INT = NULL,
    @Ma_CongDoanLe NVARCHAR(20),
    @Ten_CongDoanLe NVARCHAR(200),
    @Loai_DoiTac TINYINT,
    @CanXuatKho BIT = 1,
    @CanNhapLai BIT = 1,
    @ChoPhepNhapNhieuDot BIT = 1,
    @ChoPhepXuatNhieuDot BIT = 1,
    @ChoPhepHaoHut BIT = 0,
    @TyLeHaoHutToiDa DECIMAL(9,4) = NULL,
    @LeadTimeMacDinh_Ngay SMALLINT = NULL,
    @STT SMALLINT = 0,
    @SuDung BIT = 1,
    @GhiChu NVARCHAR(500) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF ISNULL(LTRIM(RTRIM(@Ma_CongDoanLe)), N'') = N''
            THROW 50001, N'Ma cong doan le khong duoc de trong.', 1;

        IF ISNULL(LTRIM(RTRIM(@Ten_CongDoanLe)), N'') = N''
            THROW 50002, N'Ten cong doan le khong duoc de trong.', 1;

        IF @Loai_DoiTac NOT IN (1,2)
            THROW 50003, N'Loai doi tac chi nhan 1 hoac 2.', 1;

        IF @ChoPhepHaoHut = 0
            SET @TyLeHaoHutToiDa = NULL;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.DM_CongDoanLe
            WHERE Ma_CongDoanLe = @Ma_CongDoanLe
              AND TonTai = 1
              AND ISNULL(ID_CongDoanLe,0) <> ISNULL(@ID_CongDoanLe,0)
        )
            THROW 50004, N'Ma cong doan le da ton tai.', 1;

        BEGIN TRAN;

        IF @ID_CongDoanLe IS NULL
        BEGIN
            INSERT INTO dbo.DM_CongDoanLe
            (
                Ma_CongDoanLe, Ten_CongDoanLe, Loai_DoiTac,
                CanXuatKho, CanNhapLai, ChoPhepNhapNhieuDot, ChoPhepXuatNhieuDot,
                ChoPhepHaoHut, TyLeHaoHutToiDa, LeadTimeMacDinh_Ngay,
                STT, SuDung, TonTai, GhiChu,
                TaiKhoan_Lap, Ngay_Lap, TaiKhoan_SuaCuoi, Ngay_SuaCuoi
            )
            VALUES
            (
                @Ma_CongDoanLe, @Ten_CongDoanLe, @Loai_DoiTac,
                @CanXuatKho, @CanNhapLai, @ChoPhepNhapNhieuDot, @ChoPhepXuatNhieuDot,
                @ChoPhepHaoHut, @TyLeHaoHutToiDa, @LeadTimeMacDinh_Ngay,
                @STT, @SuDung, 1, @GhiChu,
                @TaiKhoan, GETDATE(), @TaiKhoan, GETDATE()
            );

            SET @ID_CongDoanLe = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE dbo.DM_CongDoanLe
            SET Ma_CongDoanLe = @Ma_CongDoanLe,
                Ten_CongDoanLe = @Ten_CongDoanLe,
                Loai_DoiTac = @Loai_DoiTac,
                CanXuatKho = @CanXuatKho,
                CanNhapLai = @CanNhapLai,
                ChoPhepNhapNhieuDot = @ChoPhepNhapNhieuDot,
                ChoPhepXuatNhieuDot = @ChoPhepXuatNhieuDot,
                ChoPhepHaoHut = @ChoPhepHaoHut,
                TyLeHaoHutToiDa = @TyLeHaoHutToiDa,
                LeadTimeMacDinh_Ngay = @LeadTimeMacDinh_Ngay,
                STT = @STT,
                SuDung = @SuDung,
                GhiChu = @GhiChu,
                TaiKhoan_SuaCuoi = @TaiKhoan,
                Ngay_SuaCuoi = GETDATE()
            WHERE ID_CongDoanLe = @ID_CongDoanLe;
        END

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_CongDoanLe AS ID_CongDoanLe;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, @ID_CongDoanLe AS ID_CongDoanLe;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DM_Kho_GetList]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DM_Kho_GetList]
    @Keyword NVARCHAR(100) = NULL,
    @SuDung BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        K.ID_Kho,
        K.LoaiKho,
        K.LoaiVatTu,
        K.Ten_Kho,
        K.HoTen_ThuKho,
        K.DiaChi,
        K.IsKhoNgoai,
        K.STT_Kho,
        K.SuDung,
        K.TonTai
    FROM TAG_QTKD.dbo.DM_Kho K
    WHERE K.TonTai = 1
      AND (@SuDung IS NULL OR K.SuDung = @SuDung)
      AND (
            @Keyword IS NULL
            OR K.Ten_Kho LIKE N'%' + @Keyword + N'%'
            OR K.LoaiKho LIKE '%' + CONVERT(VARCHAR(100), @Keyword) + '%'
          )
    ORDER BY K.STT_Kho, K.Ten_Kho;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DM_NhaCungCap_GetList]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DM_NhaCungCap_GetList]
    @Keyword NVARCHAR(100) = NULL,
    @SuDung BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        NCC.ID_NhaCungCap,
        NCC.MaSo_NhaCungCap,
        NCC.Ten_NhaCungCap,
        NCC.Ten_NhaCungCap_DayDu,
        NCC.DiaChi,
        NCC.SoDienThoai,
        NCC.Email,
        NCC.SuDung,
        NCC.TonTai
    FROM TAG_QTKD.dbo.DM_NhaCungCap NCC
    WHERE NCC.TonTai = 1
      AND (@SuDung IS NULL OR NCC.SuDung = @SuDung)
      AND (
            @Keyword IS NULL
            OR NCC.MaSo_NhaCungCap LIKE N'%' + @Keyword + N'%'
            OR NCC.Ten_NhaCungCap LIKE N'%' + @Keyword + N'%'
            OR NCC.Ten_NhaCungCap_DayDu LIKE N'%' + @Keyword + N'%'
          )
    ORDER BY NCC.Ten_NhaCungCap;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DoiSoat_PhieuXuat]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DoiSoat_PhieuXuat]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CT.ID_Dong,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu_Xuat,
        VT.Ma_VatTu,
        VT.QuyCach AS Ten_VatTu,
        CT.SoLuong_DeNghi_Xuat,
        CT.SoLuong_DaXuat,
        (CT.SoLuong_DeNghi_Xuat - CT.SoLuong_DaXuat) AS ChenhLech
    FROM dbo.XuatLe_YeuCau_ChiTiet CT
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
        ON VT.ID_VatTu = CT.ID_VatTu_Xuat
    WHERE CT.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY CT.ID_Dong;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_DoiSoat_XuatNhap]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_DoiSoat_XuatNhap]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CT.ID_Dong,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu_Xuat,
        VTX.Ma_VatTu AS Ma_VatTu_Xuat,
        VTX.QuyCach AS Ten_VatTu_Xuat,
        CT.ID_VatTu_Nhap,
        VTN.Ma_VatTu AS Ma_VatTu_Nhap,
        VTN.QuyCach AS Ten_VatTu_Nhap,
        CT.SoLuong_DeNghi_Xuat,
        CT.SoLuong_DaXuat,
        CT.SoLuong_DaNhap,
        CT.SoLuong_HaoHut_Duyet,
        (CT.SoLuong_DaXuat - CT.SoLuong_DaNhap - CT.SoLuong_HaoHut_Duyet) AS SoLuong_DangTreo
    FROM dbo.XuatLe_YeuCau_ChiTiet CT
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VTX
        ON VTX.ID_VatTu = CT.ID_VatTu_Xuat
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VTN
        ON VTN.ID_VatTu = CT.ID_VatTu_Nhap
    WHERE CT.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY CT.ID_Dong;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_GetLenhXuatByYeuCau]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_GetLenhXuatByYeuCau]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        M.ID_XuatLe_LenhXuat_Map,
        M.ID_XuatLe_YeuCau,
        M.ID_LenhXuatVT,
        M.So_LenhXuatVT,
        M.Ngay_LenhXuatVT,
        M.TrangThaiDongBo,
        M.GhiChu
    FROM dbo.XuatLe_LenhXuat_Map M
    WHERE M.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY M.ID_XuatLe_LenhXuat_Map DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_GetPhieuNhapByYeuCau]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_GetPhieuNhapByYeuCau]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        M.ID_XuatLe_PhieuNhap_Map,
        M.ID_XuatLe_YeuCau,
        M.ID_PhieuNhapVT,
        PN.So_PhieuNhapVT,
        M.Ngay_NhapVT,
        M.SoLuong_Nhap,
        M.SoLuong_HaoHut,
        PN.ID_KhoNhap,
        KN.Ten_Kho AS Ten_KhoNhap,
        PN.ID_KhoXuat,
        KX.Ten_Kho AS Ten_KhoXuat,
        PN.NguoiGiaoHang,
        PN.GhiChu,
        M.TrangThaiDongBo
    FROM dbo.XuatLe_PhieuNhap_Map M
    LEFT JOIN TAG_QTKD.dbo.PhieuNhapVT PN
        ON PN.ID_PhieuNhapVT = M.ID_PhieuNhapVT
    LEFT JOIN TAG_QTKD.dbo.DM_Kho KN
        ON KN.ID_Kho = PN.ID_KhoNhap
    LEFT JOIN TAG_QTKD.dbo.DM_Kho KX
        ON KX.ID_Kho = PN.ID_KhoXuat
    WHERE M.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY M.ID_XuatLe_PhieuNhap_Map DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_GetPhieuNhapDetailByPhieu]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_GetPhieuNhapDetailByPhieu]
    @ID_PhieuNhapVT INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CT.ID_PhieuNhapVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu,
        VT.Ma_VatTu,
        VT.QuyCach AS Ten_VatTu,
        CT.ID_DonViTinh,
        DVT.Ten_DonViTinh,
        CT.SoLuong_NhapKho,
        CT.SoLuong_NhapKho_QuyDoi,
        CT.DonGia_QuyDoi,
        CT.ThanhTien
    FROM TAG_QTKD.dbo.PhieuNhapVT_ChiTiet CT
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
        ON VT.ID_VatTu = CT.ID_VatTu
    LEFT JOIN TAG_QTKD.dbo.DM_DonViTinh DVT
        ON DVT.ID_DonViTinh = CT.ID_DonViTinh
    WHERE CT.ID_PhieuNhapVT = @ID_PhieuNhapVT
    ORDER BY VT.Ma_VatTu;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_GetPhieuXuatByYeuCau]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_GetPhieuXuatByYeuCau]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        M.ID_XuatLe_PhieuXuat_Map,
        M.ID_XuatLe_YeuCau,
        M.ID_LenhXuatVT,
        M.ID_PhieuXuatVT,
        PX.So_PhieuXuatVT,
        M.Ngay_XuatVT,
        M.SoLuong_Xuat,
        PX.ID_KhoXuat,
        KX.Ten_Kho AS Ten_KhoXuat,
        PX.ID_KhoNhap,
        KN.Ten_Kho AS Ten_KhoNhap,
        PX.NguoiNhanHang,
        PX.GhiChu,
        M.TrangThaiDongBo
    FROM dbo.XuatLe_PhieuXuat_Map M
    LEFT JOIN TAG_QTKD.dbo.PhieuXuatVT PX
        ON PX.ID_PhieuXuatVT = M.ID_PhieuXuatVT
    LEFT JOIN TAG_QTKD.dbo.DM_Kho KX
        ON KX.ID_Kho = PX.ID_KhoXuat
    LEFT JOIN TAG_QTKD.dbo.DM_Kho KN
        ON KN.ID_Kho = PX.ID_KhoNhap
    WHERE M.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY M.ID_XuatLe_PhieuXuat_Map DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_GetPhieuXuatDetailByPhieu]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_GetPhieuXuatDetailByPhieu]
    @ID_PhieuXuatVT INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CT.ID_PhieuXuatVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu,
        VT.Ma_VatTu,
        VT.QuyCach AS Ten_VatTu,
        CT.ID_DonViTinh,
        DVT.Ten_DonViTinh,
        CT.SoLuong_XuatKho,
        CT.SoLuong_XuatKho_QuyDoi,
        CT.ID_TheKhoVT
    FROM TAG_QTKD.dbo.PhieuXuatVT_ChiTiet_TheKho CT
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
        ON VT.ID_VatTu = CT.ID_VatTu
    LEFT JOIN TAG_QTKD.dbo.DM_DonViTinh DVT
        ON DVT.ID_DonViTinh = CT.ID_DonViTinh
    WHERE CT.ID_PhieuXuatVT = @ID_PhieuXuatVT
    ORDER BY VT.Ma_VatTu;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Report_DoiSoat]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Report_DoiSoat]
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Y.ID_XuatLe_YeuCau,
        Y.So_YeuCau,
        LSX.So_LenhSanXuat,
        DH.Ma_DonHang,
        DHSP.ItemCode,
        CDL.Ten_CongDoanLe,
        Y.SoLuong_DeNghi_Xuat,
        Y.SoLuong_DaXuat,
        Y.SoLuong_DaNhap,
        Y.SoLuong_HaoHut_Duyet,
        (Y.SoLuong_DeNghi_Xuat - Y.SoLuong_DaXuat) AS ChenhLech_DeNghi_Va_Xuat,
        (Y.SoLuong_DaXuat - Y.SoLuong_DaNhap - Y.SoLuong_HaoHut_Duyet) AS ChenhLech_Xuat_Va_Nhap,
        Y.TrangThai
    FROM dbo.XuatLe_YeuCau Y
    LEFT JOIN TAG_QLSX.dbo.LenhSanXuat LSX
        ON LSX.ID_LenhSanXuat = Y.ID_LenhSanXuat
    LEFT JOIN TAG_QTKD.dbo.DonHang DH
        ON DH.ID_DonHang = Y.ID_DonHang
    LEFT JOIN TAG_QTKD.dbo.DonHang_SanPham DHSP
        ON DHSP.ID_DonHang_SanPham = Y.ID_DonHang_SanPham
    LEFT JOIN dbo.DM_CongDoanLe CDL
        ON CDL.ID_CongDoanLe = Y.ID_CongDoanLe
    WHERE (@TuNgay IS NULL OR Y.Ngay_YeuCau >= @TuNgay)
      AND (@DenNgay IS NULL OR Y.Ngay_YeuCau <= @DenNgay)
    ORDER BY Y.ID_XuatLe_YeuCau DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Report_TongHop]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Report_TongHop]
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL,
    @ID_CongDoanLe INT = NULL,
    @ID_NhaCungCap SMALLINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.usp_XuatLe_YeuCau_GetList
        @ID_CongDoanLe = @ID_CongDoanLe,
        @ID_NhaCungCap = @ID_NhaCungCap,
        @TuNgay = @TuNgay,
        @DenNgay = @DenNgay;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Report_TonTreo]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Report_TonTreo]
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Y.ID_XuatLe_YeuCau,
        Y.So_YeuCau,
        DH.Ma_DonHang,
        DHSP.ItemCode,
        CDL.Ten_CongDoanLe,
        NCC.Ten_NhaCungCap,
        CT.ID_Dong,
        VTX.Ma_VatTu,
        VTX.QuyCach AS Ten_VatTu,
        CT.SoLuong_DaXuat,
        CT.SoLuong_DaNhap,
        CT.SoLuong_HaoHut_Duyet,
        (CT.SoLuong_DaXuat - CT.SoLuong_DaNhap - CT.SoLuong_HaoHut_Duyet) AS SoLuong_DangTreo,
        Y.Deadline_HoanThanh,
        CASE
            WHEN Y.Deadline_HoanThanh IS NOT NULL
             AND CAST(GETDATE() AS DATE) > Y.Deadline_HoanThanh
             AND (CT.SoLuong_DaXuat - CT.SoLuong_DaNhap - CT.SoLuong_HaoHut_Duyet) > 0
                THEN 1
            ELSE 0
        END AS IsQuaHan
    FROM dbo.XuatLe_YeuCau Y
    INNER JOIN dbo.XuatLe_YeuCau_ChiTiet CT
        ON CT.ID_XuatLe_YeuCau = Y.ID_XuatLe_YeuCau
    LEFT JOIN TAG_QTKD.dbo.DonHang DH
        ON DH.ID_DonHang = Y.ID_DonHang
    LEFT JOIN TAG_QTKD.dbo.DonHang_SanPham DHSP
        ON DHSP.ID_DonHang_SanPham = Y.ID_DonHang_SanPham
    LEFT JOIN dbo.DM_CongDoanLe CDL
        ON CDL.ID_CongDoanLe = Y.ID_CongDoanLe
    LEFT JOIN TAG_QTKD.dbo.DM_NhaCungCap NCC
        ON NCC.ID_NhaCungCap = Y.ID_NhaCungCap
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VTX
        ON VTX.ID_VatTu = CT.ID_VatTu_Xuat
    WHERE (@TuNgay IS NULL OR Y.Ngay_YeuCau >= @TuNgay)
      AND (@DenNgay IS NULL OR Y.Ngay_YeuCau <= @DenNgay)
      AND (CT.SoLuong_DaXuat - CT.SoLuong_DaNhap - CT.SoLuong_HaoHut_Duyet) > 0
    ORDER BY Y.Deadline_HoanThanh, Y.So_YeuCau, CT.ID_Dong;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Source_KeHoach_GetList]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Source_KeHoach_GetList]
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL,
    @Ma_DonHang NVARCHAR(100) = NULL,
    @So_LenhSanXuat NVARCHAR(20) = NULL,
    @ItemCode NVARCHAR(50) = NULL,
    @ID_BoPhan SMALLINT = NULL,
    @ID_QuyTrinhSanXuat TINYINT = NULL,
    @Keyword NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH XL AS
    (
        SELECT
            ID_KeHoachSanXuat,
            ID_DonHang_SanPham,
            SUM(CASE WHEN TrangThai <> 9 THEN SoLuong_DeNghi_Xuat ELSE 0 END) AS SoLuong_DaMo
        FROM dbo.XuatLe_YeuCau
        GROUP BY ID_KeHoachSanXuat, ID_DonHang_SanPham
    )
    SELECT
        KHSX.ID_KeHoachSanXuat,
        LSX.ID_LenhSanXuat,
        LSX.So_LenhSanXuat,
        DH.ID_DonHang,
        DH.Ma_DonHang,
        DH.StyleName,
        DHSP.ID_DonHang_SanPham,
        DHSP.Ten_SanPham,
        DHSP.Mau_SanPham,
        DHSP.Co_SanPham,
        DHSP.ItemCode,
        KHSP.ID_DonHang_LoSanXuat,
        KHSP.SoLuong_SanPham AS SoLuong_KeHoach_CT,
        ISNULL(XL.SoLuong_DaMo,0) AS SoLuong_DaMo,
        KHSP.SoLuong_SanPham - ISNULL(XL.SoLuong_DaMo,0) AS SoLuong_ConLai,
        KHSX.Ngay_BatDauSX,
        KHSX.Ngay_KetThucSX,
        KHSX.ID_BoPhan,
        BP.Ten_BoPhan,
        KHSX.ID_QuyTrinhSanXuat,
        QTSX.Ten_QuyTrinhSanXuat,
        KHSX.TrangThai AS TrangThai_KeHoach
    FROM TAG_QLSX.dbo.KeHoachSanXuat KHSX
    INNER JOIN TAG_QLSX.dbo.LenhSanXuat LSX
        ON LSX.ID_LenhSanXuat = KHSX.ID_LenhSanXuat
    INNER JOIN TAG_QLSX.dbo.KeHoachSanXuat_SanPham KHSP
        ON KHSP.ID_KeHoachSanXuat = KHSX.ID_KeHoachSanXuat
    INNER JOIN TAG_QTKD.dbo.DonHang_SanPham DHSP
        ON DHSP.ID_DonHang_SanPham = KHSP.ID_DonHang_SanPham
    INNER JOIN TAG_QTKD.dbo.DonHang DH
        ON DH.ID_DonHang = LSX.ID_DonHang
    LEFT JOIN TAG_System.dbo.DM_BoPhan BP
        ON BP.ID_BoPhan = KHSX.ID_BoPhan
    LEFT JOIN TAG_QTKD.dbo.DM_QuyTrinhSanXuat QTSX
        ON QTSX.ID_QuyTrinhSanXuat = KHSX.ID_QuyTrinhSanXuat
    LEFT JOIN XL
        ON XL.ID_KeHoachSanXuat = KHSX.ID_KeHoachSanXuat
       AND XL.ID_DonHang_SanPham = KHSP.ID_DonHang_SanPham
    WHERE KHSX.TonTai = 1
      AND LSX.TonTai = 1
      AND DH.TonTai = 1
      AND DHSP.TonTai = 1
      AND (@TuNgay IS NULL OR KHSX.Ngay_BatDauSX >= @TuNgay)
      AND (@DenNgay IS NULL OR KHSX.Ngay_KetThucSX <= @DenNgay)
      AND (@Ma_DonHang IS NULL OR DH.Ma_DonHang LIKE N'%' + @Ma_DonHang + N'%')
      AND (@So_LenhSanXuat IS NULL OR LSX.So_LenhSanXuat LIKE N'%' + @So_LenhSanXuat + N'%')
      AND (@ItemCode IS NULL OR DHSP.ItemCode LIKE N'%' + @ItemCode + N'%')
      AND (@ID_BoPhan IS NULL OR KHSX.ID_BoPhan = @ID_BoPhan)
      AND (@ID_QuyTrinhSanXuat IS NULL OR KHSX.ID_QuyTrinhSanXuat = @ID_QuyTrinhSanXuat)
      AND (
            @Keyword IS NULL
            OR DH.Ma_DonHang LIKE N'%' + @Keyword + N'%'
            OR DH.StyleName LIKE N'%' + @Keyword + N'%'
            OR DHSP.Ten_SanPham LIKE N'%' + @Keyword + N'%'
            OR DHSP.ItemCode LIKE N'%' + @Keyword + N'%'
            OR LSX.So_LenhSanXuat LIKE N'%' + @Keyword + N'%'
          )
    ORDER BY KHSX.Ngay_BatDauSX DESC, LSX.So_LenhSanXuat, DHSP.ItemCode;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Source_VatTu_GetByKeHoach]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Source_VatTu_GetByKeHoach]
    @ID_KeHoachSanXuat INT,
    @ID_DonHang_SanPham INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ID_LenhSanXuat INT,
            @ID_DonHang INT,
            @ID_QuyTrinhSanXuat TINYINT;

    SELECT
        @ID_LenhSanXuat = KHSX.ID_LenhSanXuat,
        @ID_QuyTrinhSanXuat = KHSX.ID_QuyTrinhSanXuat
    FROM TAG_QLSX.dbo.KeHoachSanXuat KHSX
    WHERE KHSX.ID_KeHoachSanXuat = @ID_KeHoachSanXuat;

    SELECT @ID_DonHang = LSX.ID_DonHang
    FROM TAG_QLSX.dbo.LenhSanXuat LSX
    WHERE LSX.ID_LenhSanXuat = @ID_LenhSanXuat;

    ;WITH OpenQty AS
    (
        SELECT
            CT.ID_DonHang_VatTu,
            CT.ID_VatTu_Xuat,
            SUM(CASE WHEN Y.TrangThai <> 9 THEN CT.SoLuong_DeNghi_Xuat ELSE 0 END) AS SoLuong_DaMo
        FROM dbo.XuatLe_YeuCau_ChiTiet CT
        INNER JOIN dbo.XuatLe_YeuCau Y
            ON Y.ID_XuatLe_YeuCau = CT.ID_XuatLe_YeuCau
        WHERE Y.ID_KeHoachSanXuat = @ID_KeHoachSanXuat
        GROUP BY CT.ID_DonHang_VatTu, CT.ID_VatTu_Xuat
    )
    SELECT
        DHVT.ID_DonHang_VatTu,
        DHVT.ID_VatTu,
        VT.Ma_VatTu,
        VT.QuyCach AS Ten_VatTu,
        VT.ItemCode,
        DHVT.ID_DonViTinh,
        DVT.Ten_DonViTinh,
        ISNULL(DHVT.NhuCau_VatTu, 0) AS SoLuong_KeHoach,
        ISNULL(OQ.SoLuong_DaMo, 0) AS SoLuong_DaMo,
        ISNULL(DHVT.NhuCau_VatTu, 0) - ISNULL(OQ.SoLuong_DaMo, 0) AS SoLuong_ConLai,
        DHVT.ID_QuyTrinhSanXuat,
        DHVT.CapCho_QuyTrinhSanXuat
    FROM TAG_QTKD.dbo.DonHang_VatTu DHVT
    LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
        ON VT.ID_VatTu = DHVT.ID_VatTu
    LEFT JOIN TAG_QTKD.dbo.DM_DonViTinh DVT
        ON DVT.ID_DonViTinh = DHVT.ID_DonViTinh
    LEFT JOIN OpenQty OQ
        ON OQ.ID_DonHang_VatTu = DHVT.ID_DonHang_VatTu
       AND OQ.ID_VatTu_Xuat = DHVT.ID_VatTu
    WHERE DHVT.TonTai = 1
      AND DHVT.ID_DonHang = @ID_DonHang
      AND (
            DHVT.CapCho_QuyTrinhSanXuat = @ID_QuyTrinhSanXuat
            OR DHVT.ID_QuyTrinhSanXuat = @ID_QuyTrinhSanXuat
            OR @ID_QuyTrinhSanXuat IS NULL
          )
    ORDER BY DHVT.STT_VatTu, VT.Ma_VatTu;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Sync_PhieuNhap_FromERP]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Sync_PhieuNhap_FromERP]
    @ID_XuatLe_YeuCau BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID('tempdb..#PN') IS NOT NULL DROP TABLE #PN;

    SELECT
        M.ID_XuatLe_YeuCau,
        PN.ID_PhieuNhapVT,
        PN.Ngay_NhapVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu,
        SUM(CT.SoLuong_NhapKho) AS SoLuong_Nhap
    INTO #PN
    FROM dbo.XuatLe_PhieuXuat_Map M
    INNER JOIN TAG_QTKD.dbo.PhieuNhapVT PN
        ON PN.ID_PhieuXuatVT = M.ID_PhieuXuatVT
    INNER JOIN TAG_QTKD.dbo.PhieuNhapVT_ChiTiet CT
        ON CT.ID_PhieuNhapVT = PN.ID_PhieuNhapVT
    WHERE (@ID_XuatLe_YeuCau IS NULL OR M.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
    GROUP BY
        M.ID_XuatLe_YeuCau,
        PN.ID_PhieuNhapVT,
        PN.Ngay_NhapVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu;

    MERGE dbo.XuatLe_PhieuNhap_Map AS T
    USING
    (
        SELECT
            ID_XuatLe_YeuCau,
            ID_PhieuNhapVT,
            MAX(Ngay_NhapVT) AS Ngay_NhapVT,
            SUM(SoLuong_Nhap) AS SoLuong_Nhap
        FROM #PN
        GROUP BY ID_XuatLe_YeuCau, ID_PhieuNhapVT
    ) AS S
    ON T.ID_XuatLe_YeuCau = S.ID_XuatLe_YeuCau
   AND T.ID_PhieuNhapVT = S.ID_PhieuNhapVT
    WHEN MATCHED THEN
        UPDATE SET
            T.Ngay_NhapVT = S.Ngay_NhapVT,
            T.SoLuong_Nhap = S.SoLuong_Nhap,
            T.TrangThaiDongBo = 1
    WHEN NOT MATCHED THEN
        INSERT (ID_XuatLe_YeuCau, ID_PhieuNhapVT, Ngay_NhapVT, SoLuong_Nhap, SoLuong_HaoHut, TrangThaiDongBo)
        VALUES (S.ID_XuatLe_YeuCau, S.ID_PhieuNhapVT, S.Ngay_NhapVT, S.SoLuong_Nhap, 0, 1);

    ;WITH SN AS
    (
        SELECT
            ID_XuatLe_YeuCau,
            ID_DonHang_VatTu,
            ID_VatTu,
            SUM(SoLuong_Nhap) AS SoLuong_Nhap
        FROM #PN
        GROUP BY ID_XuatLe_YeuCau, ID_DonHang_VatTu, ID_VatTu
    )
    UPDATE CT
    SET CT.SoLuong_DaNhap = SN.SoLuong_Nhap
    FROM dbo.XuatLe_YeuCau_ChiTiet CT
    INNER JOIN SN
        ON SN.ID_XuatLe_YeuCau = CT.ID_XuatLe_YeuCau
       AND SN.ID_DonHang_VatTu = CT.ID_DonHang_VatTu
       AND SN.ID_VatTu = ISNULL(CT.ID_VatTu_Nhap, CT.ID_VatTu_Xuat);

    DECLARE @tbl TABLE(ID_XuatLe_YeuCau BIGINT PRIMARY KEY);
    INSERT INTO @tbl(ID_XuatLe_YeuCau)
    SELECT DISTINCT ID_XuatLe_YeuCau FROM #PN;

    DECLARE @ID BIGINT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT ID_XuatLe_YeuCau FROM @tbl;
    OPEN cur;
    FETCH NEXT FROM cur INTO @ID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC dbo.usp_XuatLe_YeuCau_RecalcSummary @ID_XuatLe_YeuCau = @ID;
        FETCH NEXT FROM cur INTO @ID;
    END
    CLOSE cur;
    DEALLOCATE cur;

    SELECT 0 AS Code, N'Thanh cong' AS Message, COUNT(DISTINCT ID_PhieuNhapVT) AS SoPhieuDongBo
    FROM #PN;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_Sync_PhieuXuat_FromERP]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_Sync_PhieuXuat_FromERP]
    @ID_XuatLe_YeuCau BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID('tempdb..#PX') IS NOT NULL DROP TABLE #PX;

    SELECT
        M.ID_XuatLe_YeuCau,
        PX.ID_LenhXuatVT,
        PX.ID_PhieuXuatVT,
        PX.Ngay_XuatVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu,
        SUM(CT.SoLuong_XuatKho) AS SoLuong_Xuat
    INTO #PX
    FROM dbo.XuatLe_LenhXuat_Map M
    INNER JOIN TAG_QTKD.dbo.PhieuXuatVT PX
        ON PX.ID_LenhXuatVT = M.ID_LenhXuatVT
    INNER JOIN TAG_QTKD.dbo.PhieuXuatVT_ChiTiet_TheKho CT
        ON CT.ID_PhieuXuatVT = PX.ID_PhieuXuatVT
    WHERE (@ID_XuatLe_YeuCau IS NULL OR M.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
    GROUP BY
        M.ID_XuatLe_YeuCau,
        PX.ID_LenhXuatVT,
        PX.ID_PhieuXuatVT,
        PX.Ngay_XuatVT,
        CT.ID_DonHang_VatTu,
        CT.ID_VatTu;

    MERGE dbo.XuatLe_PhieuXuat_Map AS T
    USING
    (
        SELECT
            ID_XuatLe_YeuCau,
            ID_LenhXuatVT,
            ID_PhieuXuatVT,
            MAX(Ngay_XuatVT) AS Ngay_XuatVT,
            SUM(SoLuong_Xuat) AS SoLuong_Xuat
        FROM #PX
        GROUP BY ID_XuatLe_YeuCau, ID_LenhXuatVT, ID_PhieuXuatVT
    ) AS S
    ON T.ID_XuatLe_YeuCau = S.ID_XuatLe_YeuCau
   AND T.ID_PhieuXuatVT = S.ID_PhieuXuatVT
    WHEN MATCHED THEN
        UPDATE SET
            T.ID_LenhXuatVT = S.ID_LenhXuatVT,
            T.Ngay_XuatVT = S.Ngay_XuatVT,
            T.SoLuong_Xuat = S.SoLuong_Xuat,
            T.TrangThaiDongBo = 1
    WHEN NOT MATCHED THEN
        INSERT (ID_XuatLe_YeuCau, ID_LenhXuatVT, ID_PhieuXuatVT, Ngay_XuatVT, SoLuong_Xuat, TrangThaiDongBo)
        VALUES (S.ID_XuatLe_YeuCau, S.ID_LenhXuatVT, S.ID_PhieuXuatVT, S.Ngay_XuatVT, S.SoLuong_Xuat, 1);

    ;WITH SX AS
    (
        SELECT
            ID_XuatLe_YeuCau,
            ID_DonHang_VatTu,
            ID_VatTu,
            SUM(SoLuong_Xuat) AS SoLuong_Xuat
        FROM #PX
        GROUP BY ID_XuatLe_YeuCau, ID_DonHang_VatTu, ID_VatTu
    )
    UPDATE CT
    SET CT.SoLuong_DaXuat = SX.SoLuong_Xuat
    FROM dbo.XuatLe_YeuCau_ChiTiet CT
    INNER JOIN SX
        ON SX.ID_XuatLe_YeuCau = CT.ID_XuatLe_YeuCau
       AND SX.ID_DonHang_VatTu = CT.ID_DonHang_VatTu
       AND SX.ID_VatTu = CT.ID_VatTu_Xuat;

    DECLARE @tbl TABLE(ID_XuatLe_YeuCau BIGINT PRIMARY KEY);
    INSERT INTO @tbl(ID_XuatLe_YeuCau)
    SELECT DISTINCT ID_XuatLe_YeuCau FROM #PX;

    DECLARE @ID BIGINT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT ID_XuatLe_YeuCau FROM @tbl;
    OPEN cur;
    FETCH NEXT FROM cur INTO @ID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC dbo.usp_XuatLe_YeuCau_RecalcSummary @ID_XuatLe_YeuCau = @ID;
        FETCH NEXT FROM cur INTO @ID;
    END
    CLOSE cur;
    DEALLOCATE cur;

    SELECT 0 AS Code, N'Thanh cong' AS Message, COUNT(DISTINCT ID_PhieuXuatVT) AS SoPhieuDongBo
    FROM #PX;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_UnlinkLenhXuatVT]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_UnlinkLenhXuatVT]
    @ID_XuatLe_YeuCau BIGINT,
    @ID_LenhXuatVT INT,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRAN;

        IF EXISTS
        (
            SELECT 1
            FROM TAG_QTKD.dbo.PhieuXuatVT PX
            WHERE PX.ID_LenhXuatVT = @ID_LenhXuatVT
        )
            THROW 56001, N'Lenh xuat da phat sinh phieu xuat, khong duoc huy lien ket.', 1;

        DELETE FROM dbo.XuatLe_LenhXuat_Map
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
          AND ID_LenhXuatVT = @ID_LenhXuatVT;

        EXEC dbo.usp_XuatLe_YeuCau_RecalcSummary @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = 3,
            @TrangThai_Moi = 2,
            @NoiDung = N'Huy lien ket lenh xuat.',
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_UpdateHaoHut]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_UpdateHaoHut]
    @ID_XuatLe_YeuCau BIGINT,
    @ID_Dong INT = NULL,
    @SoLuong_HaoHut DECIMAL(18,2),
    @LyDo NVARCHAR(1000) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @ChoPhepHaoHut BIT,
        @TyLeHaoHutToiDa DECIMAL(9,4),
        @SLDaXuat DECIMAL(18,2),
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @ChoPhepHaoHut = CDL.ChoPhepHaoHut,
            @TyLeHaoHutToiDa = CDL.TyLeHaoHutToiDa
        FROM dbo.XuatLe_YeuCau Y
        INNER JOIN dbo.DM_CongDoanLe CDL
            ON CDL.ID_CongDoanLe = Y.ID_CongDoanLe
        WHERE Y.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF ISNULL(@ChoPhepHaoHut, 0) = 0
            THROW 57001, N'Cong doan nay khong cho phep hao hut.', 1;

        IF @ID_Dong IS NOT NULL
        BEGIN
            SELECT @SLDaXuat = SoLuong_DaXuat
            FROM dbo.XuatLe_YeuCau_ChiTiet
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
              AND ID_Dong = @ID_Dong;

            IF @SLDaXuat IS NULL
                THROW 57002, N'Khong tim thay dong chi tiet.', 1;

            IF @TyLeHaoHutToiDa IS NOT NULL AND @SLDaXuat > 0
            BEGIN
                IF (@SoLuong_HaoHut / @SLDaXuat) > @TyLeHaoHutToiDa
                    THROW 57003, N'Hao hut vuot ty le toi da.', 1;
            END

            UPDATE dbo.XuatLe_YeuCau_ChiTiet
            SET SoLuong_HaoHut_Duyet = @SoLuong_HaoHut
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
              AND ID_Dong = @ID_Dong;
        END
        ELSE
        BEGIN
            ;WITH T AS
            (
                SELECT ID_Dong, SoLuong_DaXuat
                FROM dbo.XuatLe_YeuCau_ChiTiet
                WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
            )
            UPDATE CT
            SET SoLuong_HaoHut_Duyet =
                CASE
                    WHEN (SELECT COUNT(*) FROM T) = 0 THEN 0
                    ELSE @SoLuong_HaoHut / (SELECT COUNT(*) FROM T)
                END
            FROM dbo.XuatLe_YeuCau_ChiTiet CT
            WHERE CT.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;
        END

        EXEC dbo.usp_XuatLe_YeuCau_RecalcSummary @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        SET @NoiDungLog = N'Cap nhat hao hut. ' + ISNULL(@LyDo, N'');

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = 6,
            @TrangThai_Moi = 6,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_WriteLog]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_WriteLog]
    @ID_XuatLe_YeuCau BIGINT,
    @TrangThai_Cu TINYINT = NULL,
    @TrangThai_Moi TINYINT,
    @NoiDung NVARCHAR(1000) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.XuatLe_NhatKyTrangThai
    (
        ID_XuatLe_YeuCau,
        TrangThai_Cu,
        TrangThai_Moi,
        NoiDung,
        TaiKhoan_ThucHien,
        ThoiGian_ThucHien
    )
    VALUES
    (
        @ID_XuatLe_YeuCau,
        @TrangThai_Cu,
        @TrangThai_Moi,
        @NoiDung,
        @TaiKhoan,
        GETDATE()
    );
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_Approve]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_Approve]
    @ID_XuatLe_YeuCau BIGINT,
    @IsApprove BIT,
    @LyDo NVARCHAR(1000) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @TrangThai_Cu TINYINT,
        @TrangThai_Moi TINYINT,
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        BEGIN TRAN;

        SELECT @TrangThai_Cu = TrangThai
        FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF @TrangThai_Cu IS NULL
            THROW 53001, N'Khong tim thay yeu cau.', 1;

        IF @TrangThai_Cu <> 1
            THROW 53002, N'Chi duoc duyet tu trang thai cho duyet.', 1;

        SET @TrangThai_Moi = CASE WHEN @IsApprove = 1 THEN 2 ELSE 0 END;
        SET @NoiDungLog =
            CASE WHEN @IsApprove = 1
                 THEN N'Duyet yeu cau xuat le.'
                 ELSE N'Tu choi / tra lai yeu cau. ' + ISNULL(@LyDo, N'')
            END;

        UPDATE dbo.XuatLe_YeuCau
        SET TrangThai = @TrangThai_Moi,
            TaiKhoan_Duyet = CASE WHEN @IsApprove = 1 THEN @TaiKhoan ELSE NULL END,
            Ngay_Duyet = CASE WHEN @IsApprove = 1 THEN GETDATE() ELSE NULL END,
            TaiKhoan_SuaCuoi = @TaiKhoan,
            Ngay_SuaCuoi = GETDATE()
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = @TrangThai_Moi,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau, @TrangThai_Moi AS TrangThai_Moi;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_Cancel]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_Cancel]
    @ID_XuatLe_YeuCau BIGINT,
    @LyDo NVARCHAR(1000) = NULL,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @TrangThai_Cu TINYINT,
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        BEGIN TRAN;

        SELECT @TrangThai_Cu = TrangThai
        FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF @TrangThai_Cu IS NULL
            THROW 54001, N'Khong tim thay yeu cau.', 1;

        IF EXISTS (SELECT 1 FROM dbo.XuatLe_PhieuXuat_Map WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
            THROW 54002, N'Yeu cau da co phieu xuat, khong duoc huy.', 1;

        UPDATE dbo.XuatLe_YeuCau
        SET TrangThai = 9,
            TaiKhoan_SuaCuoi = @TaiKhoan,
            Ngay_SuaCuoi = GETDATE()
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        SET @NoiDungLog = N'Huy yeu cau. ' + ISNULL(@LyDo, N'');

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 9,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_GetByID]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_GetByID]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.usp_XuatLe_YeuCau_GetList
        @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

    SELECT
        CT.ID_XuatLe_YeuCau,
        CT.ID_Dong,
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
    WHERE CT.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY CT.ID_Dong;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_GetHistory]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_GetHistory]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ID_NhatKy,
        ID_XuatLe_YeuCau,
        TrangThai_Cu,
        TrangThai_Moi,
        NoiDung,
        TaiKhoan_ThucHien,
        ThoiGian_ThucHien
    FROM dbo.XuatLe_NhatKyTrangThai
    WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau
    ORDER BY ID_NhatKy DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_GetList]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_GetList]
    @ID_XuatLe_YeuCau BIGINT = NULL,
    @ID_KeHoachSanXuat INT = NULL,
    @ID_DonHang_SanPham INT = NULL,
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
        Y.ID_LenhSanXuat,
        LSX.So_LenhSanXuat,
        Y.ID_KeHoachSanXuat,
        Y.ID_DonHang,
        DH.Ma_DonHang,
        DH.StyleName,
        Y.ID_DonHang_SanPham,
        DHSP.Ten_SanPham,
        DHSP.ItemCode,
        DHSP.Mau_SanPham,
        DHSP.Co_SanPham,
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
    LEFT JOIN TAG_QLSX.dbo.LenhSanXuat LSX
        ON LSX.ID_LenhSanXuat = Y.ID_LenhSanXuat
    LEFT JOIN TAG_QTKD.dbo.DonHang DH
        ON DH.ID_DonHang = Y.ID_DonHang
    LEFT JOIN TAG_QTKD.dbo.DonHang_SanPham DHSP
        ON DHSP.ID_DonHang_SanPham = Y.ID_DonHang_SanPham
    LEFT JOIN dbo.DM_CongDoanLe CDL
        ON CDL.ID_CongDoanLe = Y.ID_CongDoanLe
    LEFT JOIN TAG_System.dbo.DM_BoPhan BPN
        ON BPN.ID_BoPhan = Y.ID_BoPhan_Nguon
    LEFT JOIN TAG_System.dbo.DM_BoPhan BPR
        ON BPR.ID_BoPhan = Y.ID_BoPhan_Nhan
    LEFT JOIN TAG_QTKD.dbo.DM_NhaCungCap NCC
        ON NCC.ID_NhaCungCap = Y.ID_NhaCungCap
    WHERE (@ID_XuatLe_YeuCau IS NULL OR Y.ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
      AND (@ID_KeHoachSanXuat IS NULL OR Y.ID_KeHoachSanXuat = @ID_KeHoachSanXuat)
      AND (@ID_DonHang_SanPham IS NULL OR Y.ID_DonHang_SanPham = @ID_DonHang_SanPham)
      AND (@ID_CongDoanLe IS NULL OR Y.ID_CongDoanLe = @ID_CongDoanLe)
      AND (@ID_NhaCungCap IS NULL OR Y.ID_NhaCungCap = @ID_NhaCungCap)
      AND (@TrangThai IS NULL OR Y.TrangThai = @TrangThai)
      AND (@TuNgay IS NULL OR Y.Ngay_YeuCau >= @TuNgay)
      AND (@DenNgay IS NULL OR Y.Ngay_YeuCau <= @DenNgay)
      AND (
            @Keyword IS NULL
            OR Y.So_YeuCau LIKE N'%' + @Keyword + N'%'
            OR LSX.So_LenhSanXuat LIKE N'%' + @Keyword + N'%'
            OR DH.Ma_DonHang LIKE N'%' + @Keyword + N'%'
            OR DHSP.Ten_SanPham LIKE N'%' + @Keyword + N'%'
            OR DHSP.ItemCode LIKE N'%' + @Keyword + N'%'
            OR CDL.Ten_CongDoanLe LIKE N'%' + @Keyword + N'%'
          )
    ORDER BY Y.ID_XuatLe_YeuCau DESC;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_RecalcSummary]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_RecalcSummary]
    @ID_XuatLe_YeuCau BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @TrangThaiHienTai TINYINT,
        @DaTaoLenh BIT = 0,
        @SLDeNghi DECIMAL(18,2) = 0,
        @SLDaXuat DECIMAL(18,2) = 0,
        @SLDaNhap DECIMAL(18,2) = 0,
        @SLHaoHut DECIMAL(18,2) = 0,
        @SLDangTreo DECIMAL(18,2) = 0,
        @Deadline DATE,
        @TrangThaiMoi TINYINT,
        @IsQuaHan BIT = 0;

    SELECT @TrangThaiHienTai = TrangThai,
           @Deadline = Deadline_HoanThanh
    FROM dbo.XuatLe_YeuCau
    WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

    IF @TrangThaiHienTai IS NULL
        RETURN;

    SELECT
        @SLDeNghi = ISNULL(SUM(SoLuong_DeNghi_Xuat),0),
        @SLDaXuat = ISNULL(SUM(SoLuong_DaXuat),0),
        @SLDaNhap = ISNULL(SUM(SoLuong_DaNhap),0),
        @SLHaoHut = ISNULL(SUM(SoLuong_HaoHut_Duyet),0)
    FROM dbo.XuatLe_YeuCau_ChiTiet
    WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

    IF EXISTS(SELECT 1 FROM dbo.XuatLe_LenhXuat_Map WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
        SET @DaTaoLenh = 1;

    SET @SLDangTreo = ISNULL(@SLDaXuat,0) - ISNULL(@SLDaNhap,0) - ISNULL(@SLHaoHut,0);
    IF @SLDangTreo < 0 SET @SLDangTreo = 0;

    IF @Deadline IS NOT NULL AND CAST(GETDATE() AS DATE) > @Deadline AND @SLDangTreo > 0
        SET @IsQuaHan = 1;

    SET @TrangThaiMoi =
        CASE
            WHEN @TrangThaiHienTai = 9 THEN 9
            WHEN @SLDaXuat = 0 AND @DaTaoLenh = 0 THEN @TrangThaiHienTai
            WHEN @SLDaXuat = 0 AND @DaTaoLenh = 1 THEN 3
            WHEN @SLDaXuat > 0 AND @SLDaXuat < @SLDeNghi THEN 4
            WHEN @SLDaXuat >= @SLDeNghi AND @SLDaNhap = 0 THEN 5
            WHEN @SLDaNhap > 0 AND (@SLDaNhap + @SLHaoHut) < @SLDaXuat THEN 6
            WHEN (@SLDaNhap + @SLHaoHut) >= @SLDaXuat AND @SLDaXuat > 0 THEN 7
            ELSE @TrangThaiHienTai
        END;

    IF @IsQuaHan = 1 AND @TrangThaiMoi NOT IN (7,9)
        SET @TrangThaiMoi = 8;

    UPDATE dbo.XuatLe_YeuCau
    SET SoLuong_DeNghi_Xuat = @SLDeNghi,
        SoLuong_DaXuat = @SLDaXuat,
        SoLuong_DaNhap = @SLDaNhap,
        SoLuong_HaoHut_Duyet = @SLHaoHut,
        IsQuaHan = @IsQuaHan,
        TrangThai = @TrangThaiMoi,
        Ngay_SuaCuoi = GETDATE()
    WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_SaveDraft]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_SaveDraft]
    @ID_XuatLe_YeuCau BIGINT = NULL,
    @ID_LenhSanXuat INT,
    @ID_KeHoachSanXuat INT,
    @ID_DonHang INT,
    @ID_DonHang_SanPham INT,
    @ID_DonHang_LoSanXuat INT = NULL,
    @ID_CongDoanLe INT,
    @ID_BoPhan_Nguon SMALLINT,
    @ID_BoPhan_Nhan SMALLINT = NULL,
    @ID_NhaCungCap SMALLINT = NULL,
    @ID_DonVi SMALLINT = NULL,
    @Ngay_YeuCau DATE,
    @Ngay_DuKienXuat DATE = NULL,
    @Deadline_HoanThanh DATE = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @ChiTiet dbo.TVP_XuatLe_YeuCau_ChiTiet READONLY,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @TrangThai_Cu TINYINT = NULL,
            @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        IF @ID_KeHoachSanXuat IS NULL OR @ID_DonHang_SanPham IS NULL OR @ID_CongDoanLe IS NULL
            THROW 50010, N'Thieu thong tin ke hoach / san pham / cong doan le.', 1;

        IF NOT EXISTS (SELECT 1 FROM @ChiTiet)
            THROW 50011, N'Yeu cau phai co it nhat 1 dong chi tiet.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet WHERE SoLuong_DeNghi_Xuat <= 0)
            THROW 50012, N'So luong de nghi xuat phai lon hon 0.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet
            GROUP BY ID_DonHang_VatTu, ID_VatTu_Xuat
            HAVING COUNT(1) > 1
        )
            THROW 50013, N'Khong duoc trung vat tu trong cung yeu cau.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet CT
            LEFT JOIN TAG_QTKD.dbo.DonHang_VatTu DVT
                ON DVT.ID_DonHang_VatTu = CT.ID_DonHang_VatTu
            WHERE DVT.ID_DonHang_VatTu IS NULL OR DVT.TonTai = 0 OR DVT.ID_DonHang <> @ID_DonHang
        )
            THROW 50016, N'Chi tiet co DonHang_VatTu khong hop le hoac khong thuoc don hang da chon.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet CT
            LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
                ON VT.ID_VatTu = CT.ID_VatTu_Xuat
            WHERE VT.ID_VatTu IS NULL OR VT.TonTai = 0
        )
            THROW 50017, N'Chi tiet co vat tu xuat khong hop le.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet CT
            LEFT JOIN TAG_QTKD.dbo.DM_VatTu VT
                ON VT.ID_VatTu = CT.ID_VatTu_Nhap
            WHERE CT.ID_VatTu_Nhap IS NOT NULL
              AND (VT.ID_VatTu IS NULL OR VT.TonTai = 0)
        )
            THROW 50018, N'Chi tiet co vat tu nhap khong hop le.', 1;

        BEGIN TRAN;

        IF @ID_XuatLe_YeuCau IS NULL
        BEGIN
            INSERT INTO dbo.XuatLe_YeuCau
            (
                So_YeuCau, ID_LenhSanXuat, ID_KeHoachSanXuat, ID_DonHang, ID_DonHang_SanPham,
                ID_DonHang_LoSanXuat, ID_CongDoanLe, ID_BoPhan_Nguon, ID_BoPhan_Nhan, ID_NhaCungCap,
                ID_DonVi, Ngay_YeuCau, Ngay_DuKienXuat, Deadline_HoanThanh, SoLuong_KeHoach,
                SoLuong_DeNghi_Xuat, SoLuong_DaXuat, SoLuong_DaNhap, SoLuong_HaoHut_Duyet,
                TrangThai, IsQuaHan, IsKhoa, GhiChu, TaiKhoan_Lap, Ngay_Lap, TaiKhoan_SuaCuoi, Ngay_SuaCuoi
            )
            SELECT
                N'XL' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 112), N'-', N'') 
                    + RIGHT(N'0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR(4)), 4),
                @ID_LenhSanXuat, @ID_KeHoachSanXuat, @ID_DonHang, @ID_DonHang_SanPham,
                @ID_DonHang_LoSanXuat, @ID_CongDoanLe, @ID_BoPhan_Nguon, @ID_BoPhan_Nhan, @ID_NhaCungCap,
                @ID_DonVi, @Ngay_YeuCau, @Ngay_DuKienXuat, @Deadline_HoanThanh,
                ISNULL((SELECT MAX(SoLuong_KeHoach) FROM @ChiTiet),0),
                ISNULL((SELECT SUM(SoLuong_DeNghi_Xuat) FROM @ChiTiet),0),
                0, 0, 0,
                0, 0, 0, @GhiChu, @TaiKhoan, GETDATE(), @TaiKhoan, GETDATE();

            SET @ID_XuatLe_YeuCau = SCOPE_IDENTITY();

            UPDATE dbo.XuatLe_YeuCau
            SET So_YeuCau = N'XL' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 112), N'-', N'')
                           + RIGHT(N'000000' + CAST(@ID_XuatLe_YeuCau AS NVARCHAR(6)), 6)
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;
        END
        ELSE
        BEGIN
            SELECT @TrangThai_Cu = TrangThai
            FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

            IF @TrangThai_Cu IS NULL
                THROW 50014, N'Khong tim thay yeu cau.', 1;

            IF @TrangThai_Cu NOT IN (0)
                THROW 50015, N'Chi duoc sua yeu cau o trang thai nhap.', 1;

            UPDATE dbo.XuatLe_YeuCau
            SET ID_LenhSanXuat = @ID_LenhSanXuat,
                ID_KeHoachSanXuat = @ID_KeHoachSanXuat,
                ID_DonHang = @ID_DonHang,
                ID_DonHang_SanPham = @ID_DonHang_SanPham,
                ID_DonHang_LoSanXuat = @ID_DonHang_LoSanXuat,
                ID_CongDoanLe = @ID_CongDoanLe,
                ID_BoPhan_Nguon = @ID_BoPhan_Nguon,
                ID_BoPhan_Nhan = @ID_BoPhan_Nhan,
                ID_NhaCungCap = @ID_NhaCungCap,
                ID_DonVi = @ID_DonVi,
                Ngay_YeuCau = @Ngay_YeuCau,
                Ngay_DuKienXuat = @Ngay_DuKienXuat,
                Deadline_HoanThanh = @Deadline_HoanThanh,
                SoLuong_KeHoach = ISNULL((SELECT MAX(SoLuong_KeHoach) FROM @ChiTiet),0),
                SoLuong_DeNghi_Xuat = ISNULL((SELECT SUM(SoLuong_DeNghi_Xuat) FROM @ChiTiet),0),
                GhiChu = @GhiChu,
                TaiKhoan_SuaCuoi = @TaiKhoan,
                Ngay_SuaCuoi = GETDATE()
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

            DELETE FROM dbo.XuatLe_YeuCau_ChiTiet
            WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;
        END

        INSERT INTO dbo.XuatLe_YeuCau_ChiTiet
        (
            ID_XuatLe_YeuCau, ID_Dong, ID_DonHang_VatTu, ID_VatTu_Xuat, ID_VatTu_Nhap,
            ID_DonViTinh, SoLuong_KeHoach, SoLuong_DeNghi_Xuat, SoLuong_DaXuat, SoLuong_DaNhap,
            SoLuong_HaoHut_Duyet, DonGiaTamTinh, GhiChu
        )
        SELECT
            @ID_XuatLe_YeuCau, ID_Dong, ID_DonHang_VatTu, ID_VatTu_Xuat, ID_VatTu_Nhap,
            ID_DonViTinh, SoLuong_KeHoach, SoLuong_DeNghi_Xuat, 0, 0,
            0, DonGiaTamTinh, GhiChu
        FROM @ChiTiet;

        SET @NoiDungLog = CASE 
                            WHEN @TrangThai_Cu IS NULL THEN N'Tao moi yeu cau xuat le o trang thai nhap.' 
                            ELSE N'Cap nhat yeu cau xuat le o trang thai nhap.' 
                          END;

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 0,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END CATCH
END

GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_SaveDraft_Json]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_SaveDraft_Json]
    @ID_XuatLe_YeuCau BIGINT = NULL,
    @ID_LenhSanXuat INT,
    @ID_KeHoachSanXuat INT,
    @ID_DonHang INT,
    @ID_DonHang_SanPham INT,
    @ID_DonHang_LoSanXuat INT = NULL,
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

        IF EXISTS
        (
            SELECT ID_DonHang_VatTu, ID_VatTu_Xuat
            FROM @ChiTiet
            GROUP BY ID_DonHang_VatTu, ID_VatTu_Xuat
            HAVING COUNT(*) > 1
        )
            THROW 51005, N'Chi tiet bi trung vat tu.', 1;

        BEGIN TRAN;

        IF @ID_XuatLe_YeuCau IS NULL
        BEGIN
            SET @So_YeuCau = N'XL' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 112), N'-', N'')
                         + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), N':', N'');

            INSERT INTO dbo.XuatLe_YeuCau
            (
                So_YeuCau,
                ID_LenhSanXuat,
                ID_KeHoachSanXuat,
                ID_DonHang,
                ID_DonHang_SanPham,
                ID_DonHang_LoSanXuat,
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
                @ID_LenhSanXuat,
                @ID_KeHoachSanXuat,
                @ID_DonHang,
                @ID_DonHang_SanPham,
                @ID_DonHang_LoSanXuat,
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
            SET @NoiDungLog = N'Tao moi yeu cau xuat le o trang thai nhap.';
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
            SET ID_LenhSanXuat = @ID_LenhSanXuat,
                ID_KeHoachSanXuat = @ID_KeHoachSanXuat,
                ID_DonHang = @ID_DonHang,
                ID_DonHang_SanPham = @ID_DonHang_SanPham,
                ID_DonHang_LoSanXuat = @ID_DonHang_LoSanXuat,
                ID_CongDoanLe = @ID_CongDoanLe,
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
END
GO
/****** Object:  StoredProcedure [dbo].[usp_XuatLe_YeuCau_Submit]    Script Date: 23/04/2026 14:35:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[usp_XuatLe_YeuCau_Submit]
    @ID_XuatLe_YeuCau BIGINT,
    @TaiKhoan SMALLINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @TrangThai_Cu TINYINT,
        @ID_BoPhan_Nhan SMALLINT,
        @ID_NhaCungCap SMALLINT,
        @Ngay_DuKienXuat DATE,
        @Deadline DATE,
        @NoiDungLog NVARCHAR(1000);

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @TrangThai_Cu = TrangThai,
            @ID_BoPhan_Nhan = ID_BoPhan_Nhan,
            @ID_NhaCungCap = ID_NhaCungCap,
            @Ngay_DuKienXuat = Ngay_DuKienXuat,
            @Deadline = Deadline_HoanThanh
        FROM dbo.XuatLe_YeuCau WITH (UPDLOCK, HOLDLOCK)
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        IF @TrangThai_Cu IS NULL
            THROW 52001, N'Khong tim thay yeu cau.', 1;

        IF @TrangThai_Cu <> 0
            THROW 52002, N'Chi duoc trinh duyet tu trang thai nhap.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.XuatLe_YeuCau_ChiTiet WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau)
            THROW 52003, N'Yeu cau chua co chi tiet.', 1;

        IF @ID_BoPhan_Nhan IS NULL AND @ID_NhaCungCap IS NULL
            THROW 52004, N'Phai chon bo phan nhan hoac nha cung cap.', 1;

        IF @Ngay_DuKienXuat IS NULL
            THROW 52005, N'Ngay du kien xuat khong duoc de trong.', 1;

        IF @Deadline IS NULL
            THROW 52006, N'Deadline hoan thanh khong duoc de trong.', 1;

        IF @Deadline < @Ngay_DuKienXuat
            THROW 52007, N'Deadline phai lon hon hoac bang ngay du kien xuat.', 1;

        UPDATE dbo.XuatLe_YeuCau
        SET TrangThai = 1,
            TaiKhoan_SuaCuoi = @TaiKhoan,
            Ngay_SuaCuoi = GETDATE()
        WHERE ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau;

        SET @NoiDungLog = N'Trinh duyet yeu cau xuat le.';

        EXEC dbo.usp_XuatLe_WriteLog
            @ID_XuatLe_YeuCau = @ID_XuatLe_YeuCau,
            @TrangThai_Cu = @TrangThai_Cu,
            @TrangThai_Moi = 1,
            @NoiDung = @NoiDungLog,
            @TaiKhoan = @TaiKhoan;

        COMMIT;

        SELECT 0 AS Code, N'Thanh cong' AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau, 1 AS TrangThai_Moi;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT -1 AS Code, ERROR_MESSAGE() AS Message, @ID_XuatLe_YeuCau AS ID_XuatLe_YeuCau;
    END CATCH
END

GO
