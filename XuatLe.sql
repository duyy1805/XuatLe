
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[DM_CongDoanLe]') AND type IN ('U'))
	DROP TABLE [dbo].[DM_CongDoanLe]
GO

CREATE TABLE [dbo].[DM_CongDoanLe] (
  [ID_CongDoanLe] int  IDENTITY(1,1) NOT NULL,
  [Ma_CongDoanLe] nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [Ten_CongDoanLe] nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [Loai_DoiTac] tinyint  NOT NULL,
  [CanXuatKho] bit DEFAULT 1 NOT NULL,
  [CanNhapLai] bit DEFAULT 1 NOT NULL,
  [ChoPhepNhapNhieuDot] bit DEFAULT 1 NOT NULL,
  [ChoPhepXuatNhieuDot] bit DEFAULT 1 NOT NULL,
  [ChoPhepHaoHut] bit DEFAULT 0 NOT NULL,
  [TyLeHaoHutToiDa] decimal(9,4)  NULL,
  [LeadTimeMacDinh_Ngay] smallint  NULL,
  [STT] smallint DEFAULT 0 NOT NULL,
  [SuDung] bit DEFAULT 1 NOT NULL,
  [TonTai] bit DEFAULT 1 NOT NULL,
  [GhiChu] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TaiKhoan_Lap] smallint  NOT NULL,
  [Ngay_Lap] smalldatetime DEFAULT getdate() NOT NULL,
  [TaiKhoan_SuaCuoi] smallint  NOT NULL,
  [Ngay_SuaCuoi] smalldatetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [dbo].[DM_CongDoanLe] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of DM_CongDoanLe
-- ----------------------------
SET IDENTITY_INSERT [dbo].[DM_CongDoanLe] ON
GO

INSERT INTO [dbo].[DM_CongDoanLe] ([ID_CongDoanLe], [Ma_CongDoanLe], [Ten_CongDoanLe], [Loai_DoiTac], [CanXuatKho], [CanNhapLai], [ChoPhepNhapNhieuDot], [ChoPhepXuatNhieuDot], [ChoPhepHaoHut], [TyLeHaoHutToiDa], [LeadTimeMacDinh_Ngay], [STT], [SuDung], [TonTai], [GhiChu], [TaiKhoan_Lap], [Ngay_Lap], [TaiKhoan_SuaCuoi], [Ngay_SuaCuoi]) VALUES (N'3', N'IN_NGOAI_TEST', N'In ngoài', N'2', N'1', N'1', N'1', N'1', N'1', N'5.0000', N'3', N'1', N'1', N'1', NULL, N'1', N'2026-04-23 08:45:00', N'1', N'2026-04-23 08:45:00')
GO

SET IDENTITY_INSERT [dbo].[DM_CongDoanLe] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_LenhXuat_Map
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_LenhXuat_Map]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_LenhXuat_Map]
GO

CREATE TABLE [dbo].[XuatLe_LenhXuat_Map] (
  [ID_XuatLe_LenhXuat_Map] bigint  IDENTITY(1,1) NOT NULL,
  [ID_XuatLe_YeuCau] bigint  NOT NULL,
  [ID_LenhXuatVT] int  NOT NULL,
  [So_LenhXuatVT] nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [Ngay_LenhXuatVT] smalldatetime  NULL,
  [TrangThaiDongBo] tinyint DEFAULT 0 NOT NULL,
  [GhiChu] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[XuatLe_LenhXuat_Map] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_LenhXuat_Map
-- ----------------------------
SET IDENTITY_INSERT [dbo].[XuatLe_LenhXuat_Map] ON
GO

INSERT INTO [dbo].[XuatLe_LenhXuat_Map] ([ID_XuatLe_LenhXuat_Map], [ID_XuatLe_YeuCau], [ID_LenhXuatVT], [So_LenhXuatVT], [Ngay_LenhXuatVT], [TrangThaiDongBo], [GhiChu]) VALUES (N'2', N'3', N'339550', N'XLX20260423134352', N'2026-04-23 13:44:00', N'0', NULL)
GO

SET IDENTITY_INSERT [dbo].[XuatLe_LenhXuat_Map] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_NhatKyTrangThai
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_NhatKyTrangThai]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_NhatKyTrangThai]
GO

CREATE TABLE [dbo].[XuatLe_NhatKyTrangThai] (
  [ID_NhatKy] bigint  IDENTITY(1,1) NOT NULL,
  [ID_XuatLe_YeuCau] bigint  NOT NULL,
  [TrangThai_Cu] tinyint  NULL,
  [TrangThai_Moi] tinyint  NOT NULL,
  [NoiDung] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TaiKhoan_ThucHien] smallint  NOT NULL,
  [ThoiGian_ThucHien] smalldatetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [dbo].[XuatLe_NhatKyTrangThai] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_NhatKyTrangThai
-- ----------------------------
SET IDENTITY_INSERT [dbo].[XuatLe_NhatKyTrangThai] ON
GO

INSERT INTO [dbo].[XuatLe_NhatKyTrangThai] ([ID_NhatKy], [ID_XuatLe_YeuCau], [TrangThai_Cu], [TrangThai_Moi], [NoiDung], [TaiKhoan_ThucHien], [ThoiGian_ThucHien]) VALUES (N'6', N'3', NULL, N'0', N'Tao moi yeu cau xuat le o trang thai nhap.', N'1', N'2026-04-23 13:44:00')
GO

INSERT INTO [dbo].[XuatLe_NhatKyTrangThai] ([ID_NhatKy], [ID_XuatLe_YeuCau], [TrangThai_Cu], [TrangThai_Moi], [NoiDung], [TaiKhoan_ThucHien], [ThoiGian_ThucHien]) VALUES (N'7', N'3', N'0', N'1', N'Trinh duyet yeu cau xuat le.', N'1', N'2026-04-23 13:44:00')
GO

INSERT INTO [dbo].[XuatLe_NhatKyTrangThai] ([ID_NhatKy], [ID_XuatLe_YeuCau], [TrangThai_Cu], [TrangThai_Moi], [NoiDung], [TaiKhoan_ThucHien], [ThoiGian_ThucHien]) VALUES (N'8', N'3', N'1', N'2', N'Duyet yeu cau xuat le.', N'1', N'2026-04-23 13:44:00')
GO

INSERT INTO [dbo].[XuatLe_NhatKyTrangThai] ([ID_NhatKy], [ID_XuatLe_YeuCau], [TrangThai_Cu], [TrangThai_Moi], [NoiDung], [TaiKhoan_ThucHien], [ThoiGian_ThucHien]) VALUES (N'9', N'3', N'2', N'3', N'Tao lenh xuat vat tu. So lenh: XLX20260423134352', N'1', N'2026-04-23 13:44:00')
GO

SET IDENTITY_INSERT [dbo].[XuatLe_NhatKyTrangThai] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_PhieuNhap_Map
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_PhieuNhap_Map]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_PhieuNhap_Map]
GO

CREATE TABLE [dbo].[XuatLe_PhieuNhap_Map] (
  [ID_XuatLe_PhieuNhap_Map] bigint  IDENTITY(1,1) NOT NULL,
  [ID_XuatLe_YeuCau] bigint  NOT NULL,
  [ID_PhieuNhapVT] int  NOT NULL,
  [Ngay_NhapVT] smalldatetime  NULL,
  [SoLuong_Nhap] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_HaoHut] decimal(18,2) DEFAULT 0 NOT NULL,
  [TrangThaiDongBo] tinyint DEFAULT 0 NOT NULL,
  [GhiChu] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[XuatLe_PhieuNhap_Map] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_PhieuNhap_Map
-- ----------------------------
SET IDENTITY_INSERT [dbo].[XuatLe_PhieuNhap_Map] ON
GO

SET IDENTITY_INSERT [dbo].[XuatLe_PhieuNhap_Map] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_PhieuXuat_Map
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_PhieuXuat_Map]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_PhieuXuat_Map]
GO

CREATE TABLE [dbo].[XuatLe_PhieuXuat_Map] (
  [ID_XuatLe_PhieuXuat_Map] bigint  IDENTITY(1,1) NOT NULL,
  [ID_XuatLe_YeuCau] bigint  NOT NULL,
  [ID_LenhXuatVT] int  NULL,
  [ID_PhieuXuatVT] int  NOT NULL,
  [Ngay_XuatVT] smalldatetime  NULL,
  [SoLuong_Xuat] decimal(18,2) DEFAULT 0 NOT NULL,
  [TrangThaiDongBo] tinyint DEFAULT 0 NOT NULL
)
GO

ALTER TABLE [dbo].[XuatLe_PhieuXuat_Map] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_PhieuXuat_Map
-- ----------------------------
SET IDENTITY_INSERT [dbo].[XuatLe_PhieuXuat_Map] ON
GO

SET IDENTITY_INSERT [dbo].[XuatLe_PhieuXuat_Map] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_YeuCau
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_YeuCau]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_YeuCau]
GO

CREATE TABLE [dbo].[XuatLe_YeuCau] (
  [ID_XuatLe_YeuCau] bigint  IDENTITY(1,1) NOT NULL,
  [So_YeuCau] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID_LenhSanXuat] int  NOT NULL,
  [ID_KeHoachSanXuat] int  NOT NULL,
  [ID_DonHang] int  NOT NULL,
  [ID_DonHang_SanPham] int  NOT NULL,
  [ID_DonHang_LoSanXuat] int  NULL,
  [ID_CongDoanLe] int  NOT NULL,
  [ID_BoPhan_Nguon] smallint  NOT NULL,
  [ID_BoPhan_Nhan] smallint  NULL,
  [ID_NhaCungCap] smallint  NULL,
  [ID_DonVi] smallint  NULL,
  [Ngay_YeuCau] date  NOT NULL,
  [Ngay_DuKienXuat] date  NULL,
  [Deadline_HoanThanh] date  NULL,
  [SoLuong_KeHoach] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DeNghi_Xuat] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DaXuat] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DaNhap] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_HaoHut_Duyet] decimal(18,2) DEFAULT 0 NOT NULL,
  [TrangThai] tinyint  NOT NULL,
  [IsQuaHan] bit DEFAULT 0 NOT NULL,
  [IsKhoa] bit DEFAULT 0 NOT NULL,
  [GhiChu] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TaiKhoan_Lap] smallint  NOT NULL,
  [Ngay_Lap] smalldatetime DEFAULT getdate() NOT NULL,
  [TaiKhoan_SuaCuoi] smallint  NOT NULL,
  [Ngay_SuaCuoi] smalldatetime DEFAULT getdate() NOT NULL,
  [TaiKhoan_Duyet] smallint  NULL,
  [Ngay_Duyet] smalldatetime  NULL
)
GO

ALTER TABLE [dbo].[XuatLe_YeuCau] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_YeuCau
-- ----------------------------
SET IDENTITY_INSERT [dbo].[XuatLe_YeuCau] ON
GO

INSERT INTO [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau], [So_YeuCau], [ID_LenhSanXuat], [ID_KeHoachSanXuat], [ID_DonHang], [ID_DonHang_SanPham], [ID_DonHang_LoSanXuat], [ID_CongDoanLe], [ID_BoPhan_Nguon], [ID_BoPhan_Nhan], [ID_NhaCungCap], [ID_DonVi], [Ngay_YeuCau], [Ngay_DuKienXuat], [Deadline_HoanThanh], [SoLuong_KeHoach], [SoLuong_DeNghi_Xuat], [SoLuong_DaXuat], [SoLuong_DaNhap], [SoLuong_HaoHut_Duyet], [TrangThai], [IsQuaHan], [IsKhoa], [GhiChu], [TaiKhoan_Lap], [Ngay_Lap], [TaiKhoan_SuaCuoi], [Ngay_SuaCuoi], [TaiKhoan_Duyet], [Ngay_Duyet]) VALUES (N'3', N'XL20260423134352', N'6', N'2', N'1', N'0', N'0', N'3', N'3', NULL, N'1', NULL, N'2026-04-23', N'2026-04-24', N'2026-04-26', N'100.00', N'10.00', N'0.00', N'0.00', N'0.00', N'3', N'0', N'0', N'Test flow', N'1', N'2026-04-23 13:44:00', N'1', N'2026-04-23 13:44:00', N'1', N'2026-04-23 13:44:00')
GO

SET IDENTITY_INSERT [dbo].[XuatLe_YeuCau] OFF
GO


-- ----------------------------
-- Table structure for XuatLe_YeuCau_ChiTiet
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatLe_YeuCau_ChiTiet]') AND type IN ('U'))
	DROP TABLE [dbo].[XuatLe_YeuCau_ChiTiet]
GO

CREATE TABLE [dbo].[XuatLe_YeuCau_ChiTiet] (
  [ID_XuatLe_YeuCau] bigint  NOT NULL,
  [ID_Dong] int  NOT NULL,
  [ID_DonHang_VatTu] int  NOT NULL,
  [ID_VatTu_Xuat] int  NOT NULL,
  [ID_VatTu_Nhap] int  NULL,
  [ID_DonViTinh] smallint  NOT NULL,
  [SoLuong_KeHoach] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DeNghi_Xuat] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DaXuat] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_DaNhap] decimal(18,2) DEFAULT 0 NOT NULL,
  [SoLuong_HaoHut_Duyet] decimal(18,2) DEFAULT 0 NOT NULL,
  [DonGiaTamTinh] decimal(18,4)  NULL,
  [GhiChu] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[XuatLe_YeuCau_ChiTiet] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of XuatLe_YeuCau_ChiTiet
-- ----------------------------
INSERT INTO [dbo].[XuatLe_YeuCau_ChiTiet] ([ID_XuatLe_YeuCau], [ID_Dong], [ID_DonHang_VatTu], [ID_VatTu_Xuat], [ID_VatTu_Nhap], [ID_DonViTinh], [SoLuong_KeHoach], [SoLuong_DeNghi_Xuat], [SoLuong_DaXuat], [SoLuong_DaNhap], [SoLuong_HaoHut_Duyet], [DonGiaTamTinh], [GhiChu]) VALUES (N'3', N'1', N'1', N'2', N'2', N'7', N'100.00', N'10.00', N'0.00', N'0.00', N'0.00', N'0.0000', N'Test xuất lẻ')
GO


-- ----------------------------
-- Auto increment value for DM_CongDoanLe
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[DM_CongDoanLe]', RESEED, 3)
GO


-- ----------------------------
-- Indexes structure for table DM_CongDoanLe
-- ----------------------------
CREATE UNIQUE NONCLUSTERED INDEX [UX_DM_CongDoanLe_Ma]
ON [dbo].[DM_CongDoanLe] (
  [Ma_CongDoanLe] ASC
)
WHERE ([TonTai]=(1))
GO

CREATE NONCLUSTERED INDEX [IX_DM_CongDoanLe_Ten]
ON [dbo].[DM_CongDoanLe] (
  [Ten_CongDoanLe] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table DM_CongDoanLe
-- ----------------------------
ALTER TABLE [dbo].[DM_CongDoanLe] ADD CONSTRAINT [PK_DM_CongDoanLe] PRIMARY KEY CLUSTERED ([ID_CongDoanLe])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for XuatLe_LenhXuat_Map
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[XuatLe_LenhXuat_Map]', RESEED, 2)
GO


-- ----------------------------
-- Indexes structure for table XuatLe_LenhXuat_Map
-- ----------------------------
CREATE NONCLUSTERED INDEX [IX_XuatLe_LenhXuat_Map_YeuCau]
ON [dbo].[XuatLe_LenhXuat_Map] (
  [ID_XuatLe_YeuCau] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_LenhXuat_Map_LenhXuat]
ON [dbo].[XuatLe_LenhXuat_Map] (
  [ID_LenhXuatVT] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_LenhXuat_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_LenhXuat_Map] ADD CONSTRAINT [PK_XuatLe_LenhXuat_Map] PRIMARY KEY CLUSTERED ([ID_XuatLe_LenhXuat_Map])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for XuatLe_NhatKyTrangThai
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[XuatLe_NhatKyTrangThai]', RESEED, 9)
GO


-- ----------------------------
-- Indexes structure for table XuatLe_NhatKyTrangThai
-- ----------------------------
CREATE NONCLUSTERED INDEX [IX_XuatLe_NhatKyTrangThai_YeuCau]
ON [dbo].[XuatLe_NhatKyTrangThai] (
  [ID_XuatLe_YeuCau] ASC,
  [ThoiGian_ThucHien] DESC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_NhatKyTrangThai
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_NhatKyTrangThai] ADD CONSTRAINT [PK_XuatLe_NhatKyTrangThai] PRIMARY KEY CLUSTERED ([ID_NhatKy])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for XuatLe_PhieuNhap_Map
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[XuatLe_PhieuNhap_Map]', RESEED, 1)
GO


-- ----------------------------
-- Indexes structure for table XuatLe_PhieuNhap_Map
-- ----------------------------
CREATE NONCLUSTERED INDEX [IX_XuatLe_PhieuNhap_Map_YeuCau]
ON [dbo].[XuatLe_PhieuNhap_Map] (
  [ID_XuatLe_YeuCau] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_PhieuNhap_Map_Phieu]
ON [dbo].[XuatLe_PhieuNhap_Map] (
  [ID_PhieuNhapVT] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_PhieuNhap_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_PhieuNhap_Map] ADD CONSTRAINT [PK_XuatLe_PhieuNhap_Map] PRIMARY KEY CLUSTERED ([ID_XuatLe_PhieuNhap_Map])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for XuatLe_PhieuXuat_Map
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[XuatLe_PhieuXuat_Map]', RESEED, 1)
GO


-- ----------------------------
-- Indexes structure for table XuatLe_PhieuXuat_Map
-- ----------------------------
CREATE NONCLUSTERED INDEX [IX_XuatLe_PhieuXuat_Map_YeuCau]
ON [dbo].[XuatLe_PhieuXuat_Map] (
  [ID_XuatLe_YeuCau] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_PhieuXuat_Map_Phieu]
ON [dbo].[XuatLe_PhieuXuat_Map] (
  [ID_PhieuXuatVT] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_PhieuXuat_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_PhieuXuat_Map] ADD CONSTRAINT [PK_XuatLe_PhieuXuat_Map] PRIMARY KEY CLUSTERED ([ID_XuatLe_PhieuXuat_Map])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for XuatLe_YeuCau
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[XuatLe_YeuCau]', RESEED, 3)
GO


-- ----------------------------
-- Indexes structure for table XuatLe_YeuCau
-- ----------------------------
CREATE UNIQUE NONCLUSTERED INDEX [UX_XuatLe_YeuCau_SoYeuCau]
ON [dbo].[XuatLe_YeuCau] (
  [So_YeuCau] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_YeuCau_KeHoach]
ON [dbo].[XuatLe_YeuCau] (
  [ID_KeHoachSanXuat] ASC,
  [ID_DonHang_SanPham] ASC,
  [ID_CongDoanLe] ASC,
  [TrangThai] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_YeuCau_Deadline]
ON [dbo].[XuatLe_YeuCau] (
  [Deadline_HoanThanh] ASC,
  [TrangThai] ASC,
  [IsQuaHan] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_YeuCau_DonHang]
ON [dbo].[XuatLe_YeuCau] (
  [ID_DonHang] ASC,
  [ID_LenhSanXuat] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_YeuCau
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_YeuCau] ADD CONSTRAINT [PK_XuatLe_YeuCau] PRIMARY KEY CLUSTERED ([ID_XuatLe_YeuCau])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table XuatLe_YeuCau_ChiTiet
-- ----------------------------
CREATE NONCLUSTERED INDEX [IX_XuatLe_YeuCau_ChiTiet_VatTu]
ON [dbo].[XuatLe_YeuCau_ChiTiet] (
  [ID_DonHang_VatTu] ASC,
  [ID_VatTu_Xuat] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_XuatLe_YeuCau_ChiTiet_Header]
ON [dbo].[XuatLe_YeuCau_ChiTiet] (
  [ID_XuatLe_YeuCau] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table XuatLe_YeuCau_ChiTiet
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_YeuCau_ChiTiet] ADD CONSTRAINT [PK_XuatLe_YeuCau_ChiTiet] PRIMARY KEY CLUSTERED ([ID_XuatLe_YeuCau], [ID_Dong])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Foreign Keys structure for table XuatLe_LenhXuat_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_LenhXuat_Map] ADD CONSTRAINT [FK_XuatLe_LenhXuat_Map_Header] FOREIGN KEY ([ID_XuatLe_YeuCau]) REFERENCES [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO


-- ----------------------------
-- Foreign Keys structure for table XuatLe_NhatKyTrangThai
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_NhatKyTrangThai] ADD CONSTRAINT [FK_XuatLe_NhatKyTrangThai_Header] FOREIGN KEY ([ID_XuatLe_YeuCau]) REFERENCES [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO


-- ----------------------------
-- Foreign Keys structure for table XuatLe_PhieuNhap_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_PhieuNhap_Map] ADD CONSTRAINT [FK_XuatLe_PhieuNhap_Map_Header] FOREIGN KEY ([ID_XuatLe_YeuCau]) REFERENCES [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO


-- ----------------------------
-- Foreign Keys structure for table XuatLe_PhieuXuat_Map
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_PhieuXuat_Map] ADD CONSTRAINT [FK_XuatLe_PhieuXuat_Map_Header] FOREIGN KEY ([ID_XuatLe_YeuCau]) REFERENCES [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO


-- ----------------------------
-- Foreign Keys structure for table XuatLe_YeuCau_ChiTiet
-- ----------------------------
ALTER TABLE [dbo].[XuatLe_YeuCau_ChiTiet] ADD CONSTRAINT [FK_XuatLe_YeuCau_ChiTiet_Header] FOREIGN KEY ([ID_XuatLe_YeuCau]) REFERENCES [dbo].[XuatLe_YeuCau] ([ID_XuatLe_YeuCau]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

