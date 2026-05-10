require('dotenv').config();
const { getPool, connectDB } = require('./src/config/db');

async function run() {
  await connectDB();
  const pool = getPool();
  try {
    const q = `
      SELECT TOP 5
          C.ID_PhieuNhapBTP,
          C.ID_DonHang_SanPham,
          C.SoLuong_NhapKho,
          P.So_PhieuNhapBTP,
          P.Ngay_NhapBTP,
          SP.Ten_SanPham
      FROM TAG_QTKD.dbo.PhieuNhapBTP_ChiTiet C
      INNER JOIN TAG_QTKD.dbo.PhieuNhapBTP P ON P.ID_PhieuNhapBTP = C.ID_PhieuNhapBTP
      LEFT JOIN TAG_QTKD.dbo.DonHang_SanPham SP ON SP.ID_DonHang_SanPham = C.ID_DonHang_SanPham
      WHERE P.TonTai = 1
      ORDER BY P.Ngay_NhapBTP DESC
    `;
    const res = await pool.request().query(q);
    console.log(res.recordset);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
