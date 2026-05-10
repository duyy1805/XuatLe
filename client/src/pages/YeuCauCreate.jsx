import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableContainer } from '../components/ui/Table';
import { Save, ArrowLeft, PackagePlus, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import sourceApi from '../api/sourceApi';
import dmApi from '../api/dmApi';
import yeuCauApi from '../api/yeuCauApi';

// const createEmptyRow = () => ({
//   __rowId: crypto.randomUUID(),
//   ID_VatTu: null,
//   ID_DonHang_VatTu: null,
//   idPhieuNhapBTP_Source: null,
//   SoLuong_DeNghi_Xuat: 0,
//   GhiChu_ChiTiet: ''
// });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

function SearchableSelect({
  label,
  value,
  options,
  getValue,
  getLabel,
  placeholder,
  disabled,
  onChange,
  className,
  wrapperClass
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const selected = options.find(option => getValue(option).toString() === value?.toString());
  const displayValue = isOpen ? query : selected ? getLabel(selected) : '';
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter(option => getLabel(option).toLowerCase().includes(normalizedQuery))
    : options.slice(0, 30);

  const handleSelect = (option) => {
    onChange(option);
    setQuery('');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;

    const updatePosition = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // match max-h-60 (approx 240px)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      const preferredWidth = 500;
      const availableSpaceRight = window.innerWidth - rect.left - 16;
      const finalWidth = Math.max(rect.width, Math.min(preferredWidth, availableSpaceRight));

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: finalWidth,
        ...(showAbove ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 })
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div className={['flex flex-col gap-1.5', wrapperClass].filter(Boolean).join(' ')}>
      {label && <label className="text-sm font-medium text-slate-900 dark:text-white">{label}</label>}
      <div className={`relative ${className || ''}`}>
        <input
          ref={inputRef}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:border-white/20 dark:focus:border-blue-500 dark:disabled:bg-slate-900"
        />
        {isOpen && !disabled && createPortal(
          <div
            style={dropdownStyle}
            className="z-[9999] max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-xl dark:border-white/10 dark:bg-slate-900 dark:shadow-none"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={getValue(option)}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className="block w-full px-3 py-2 text-left text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                >
                  {getLabel(option)}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-slate-500 dark:text-slate-400">Không tìm thấy dữ liệu phù hợp</div>
            )}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

export default function YeuCauCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dsLenhXuat, setDsLenhXuat] = useState([]);
  const [dsPhieuNhapBTP, setDsPhieuNhapBTP] = useState([]);
  const [dsCongDoan, setDsCongDoan] = useState([]);
  const [dsBoPhan, setDsBoPhan] = useState([]);
  const [dsVatTu, setDsVatTu] = useState([]);


  const [formData, setFormData] = useState({
    idCongDoanLe: '',
    idBoPhanNguon: '3',
    idBoPhanNhan: '',
    idLenhXuatVT: '',
    ngayYeuCau: new Date().toISOString().slice(0, 10),
    ngayDuKienXuat: '',
    deadlineHoanThanh: '',
    ghiChu: ''
  });

  useEffect(() => {
    Promise.all([
      yeuCauApi.getERPLenhXuat({}),
      sourceApi.getPhieuNhapBTP({}).catch(() => ({ success: true, data: [] })), // Graceful fallback
      dmApi.getCongDoanLe({}),
      dmApi.getBoPhan({})
    ]).then(([resLx, resPhieu, resCd, resBp]) => {
      if (resLx.success) setDsLenhXuat(resLx.data);
      if (resPhieu?.success) setDsPhieuNhapBTP(resPhieu.data);
      if (resCd.success) setDsCongDoan(resCd.data);
      if (resBp.success) setDsBoPhan(resBp.data);
    }).catch(() => {
      toast.error('Lỗi tải dữ liệu danh mục');
    });
  }, []);

  const getLenhXuatLabel = useCallback((lx) => {
    return [
      lx.So_LenhXuatVT,
      lx.Ten_BoPhan,
      lx.Ten_KhoXuat
    ].filter(Boolean).join(' - ');
  }, []);

  const getPhieuNhapLabel = useCallback((p) => {
    return [
      p.So_PhieuNhapBTP,
      p.Ten_SanPham,
      `(Còn: ${p.SoLuong_ConLai ?? p.SoLuong_NhapKho})`
    ].filter(Boolean).join(' - ');
  }, []);

  const getBoPhanLabel = useCallback((bp) => {
    return [bp.Ma_NhaThau, bp.Ten_BoPhan].filter(Boolean).join(' - ');
  }, []);

  const getCongDoanLabel = useCallback((cd) => {
    return [cd.Ma_CongDoanLe, cd.Ten_CongDoanLe].filter(Boolean).join(' - ');
  }, []);

  const handleLenhXuatChange = useCallback(async (lx) => {
    setFormData(prev => ({ ...prev, idLenhXuatVT: lx.ID_LenhXuatVT, idNhaCungCap: lx.ID_NhaCungCap }));
    try {
      setLoading(true);
      const res = await yeuCauApi.getERPLenhXuatDetail(lx.ID_LenhXuatVT);
      if (res.success) {
        setDsVatTu(res.data.map(vt => ({
          __rowId: crypto.randomUUID(),
          ID_VatTu: vt.ID_VatTu,
          ID_DonHang_VatTu: vt.ID_DonHang_VatTu,
          Ma_VatTu: vt.Ma_VatTu,
          Ten_VatTu: vt.Ten_VatTu,
          ID_DonViTinh: vt.ID_DonViTinh,
          Ten_DonViTinh: vt.Ten_DonViTinh,
          SoLuong_DeNghi: vt.SoLuong_DeNghi || 0,
          idPhieuNhapBTP_Source: null,
          SoLuong_DeNghi_Xuat: vt.SoLuong_DeNghi || 0,
          GhiChu_ChiTiet: ''
        })));
        toast.success(`Đã tải ${res.data.length} vật tư từ lệnh xuất.`);
      }
    } catch (e) {
      toast.error('Lỗi lấy chi tiết lệnh xuất');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePhieuNhapRowChange = useCallback((index, phieu) => {
    setDsVatTu(prev => {
      const newVatTu = [...prev];
      if (phieu) {
        newVatTu[index].idPhieuNhapBTP_Source = phieu.ID_PhieuNhapBTP;
        newVatTu[index].idDonHang_Source = phieu.ID_DonHang;
        newVatTu[index].idDonHangSanPham_Source = phieu.ID_DonHang_SanPham;
        newVatTu[index].idDonHangLoSanXuat_Source = phieu.ID_DonHang_LoSanXuat;
        const slConLai = phieu.SoLuong_ConLai ?? phieu.SoLuong_NhapKho ?? 0;
        const slErp = newVatTu[index].SoLuong_DeNghi || 0;
        // Lấy tối đa theo lệnh xuất, nhưng không vượt quá số lượng còn lại của phiếu nhập
        newVatTu[index].SoLuong_DeNghi_Xuat = Math.min(slErp, slConLai);
      } else {
        newVatTu[index].idPhieuNhapBTP_Source = null;
        newVatTu[index].idDonHang_Source = null;
        newVatTu[index].idDonHangSanPham_Source = null;
        newVatTu[index].idDonHangLoSanXuat_Source = null;
        newVatTu[index].SoLuong_DeNghi_Xuat = newVatTu[index].SoLuong_DeNghi || 0;
      }
      return newVatTu;
    });
  }, []);

  const handleSoLuongChange = useCallback((index, value) => {
    setDsVatTu(prev => {
      const newVatTu = [...prev];
      const row = newVatTu[index];
      const numValue = Number(value);

      const slErp = row.SoLuong_DeNghi || 0;
      const phieu = dsPhieuNhapBTP.find(p => p.ID_PhieuNhapBTP === row.idPhieuNhapBTP_Source);
      const slBtp = phieu ? (phieu.SoLuong_ConLai ?? phieu.SoLuong_NhapKho ?? 0) : Infinity;

      const maxAllow = Math.min(slErp, slBtp);

      if (numValue > maxAllow) {
        toast.warning(`Số lượng không được vượt quá ${maxAllow}`);
        row.SoLuong_DeNghi_Xuat = maxAllow;
      } else {
        row.SoLuong_DeNghi_Xuat = numValue;
      }

      return newVatTu;
    });
  }, [dsPhieuNhapBTP]);

  const handleRemoveVatTu = useCallback((index) => {
    setDsVatTu(prev => {
      const newVatTu = [...prev];
      newVatTu.splice(index, 1);
      return newVatTu;
    });
  }, []);

  const handleSave = async (isConfirm = false) => {
    if (!formData.idCongDoanLe) {
      toast.error('Vui lòng chọn Công đoạn lẻ!');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (formData.ngayDuKienXuat && formData.ngayDuKienXuat < today) {
      toast.error('Ngày dự kiến xuất không được nhỏ hơn ngày hiện tại!');
      return;
    }

    if (formData.deadlineHoanThanh && formData.ngayDuKienXuat && formData.deadlineHoanThanh < formData.ngayDuKienXuat) {
      toast.error('Hạn hoàn thành không được nhỏ hơn ngày dự kiến xuất!');
      return;
    }

    const chiTietToSave = dsVatTu.filter(vt => vt.ID_VatTu && vt.SoLuong_DeNghi_Xuat > 0);
    if (chiTietToSave.length === 0) {
      toast.warning('Vui lòng thêm vật tư và nhập số lượng đề nghị xuất!');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        idLenhXuatVT: formData.idLenhXuatVT,
        idCongDoanLe: formData.idCongDoanLe,
        ...formData,
        chiTiet: chiTietToSave.map((vt, idx) => ({
          idDong: idx + 1,
          idLenhSanXuat: vt.ID_LenhSanXuat,
          idKeHoachSanXuat: vt.ID_KeHoachSanXuat,
          idDonHang: vt.ID_DonHang,
          idDonHangVatTu: vt.ID_DonHang_VatTu,
          idVatTuXuat: vt.ID_VatTu,
          idVatTuNhap: vt.ID_VatTu,
          idDonViTinh: vt.ID_DonViTinh,
          idPhieuNhapBTPSource: vt.idPhieuNhapBTP_Source,
          // idDonHang: vt.idDonHang_Source,
          idDonHangSanPham: vt.idDonHangSanPham_Source,
          idDonHangLoSanXuat: vt.idDonHangLoSanXuat_Source,
          soLuongKeHoach: vt.SoLuong_DeNghi,
          soLuongDeNghiXuat: vt.SoLuong_DeNghi_Xuat,
          donGiaTamTinh: 0,
          ghiChu: vt.GhiChu_ChiTiet
        }))
      };

      console.log('DEBUG - Payload Header:', { ...payload, chiTiet: undefined });
      console.table(payload.chiTiet.map(c => ({
        'Mã VT': c.idVatTuXuat,
        'SL': c.soLuongDeNghiXuat,
        'BTP': c.idPhieuNhapBTPSource,
        'ĐH': c.idDonHang,
        'LSX': c.idDonHangLoSanXuat,
        'SP': c.idDonHangSanPham
      })));

      const res = await yeuCauApi.saveDraft(payload);
      if (res.success) {
        const newId = res.data.ID_XuatLe_YeuCau;

        if (isConfirm) {
          const submitRes = await yeuCauApi.submit(newId);
          if (submitRes.success) {
            toast.success('Tạo và xác nhận yêu cầu thành công!');
            navigate(`/yeu-cau/${newId}`);
            return;
          }
        }

        toast.success('Tạo yêu cầu thành công!');
        navigate(`/yeu-cau/${newId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Lỗi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/70 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white dark:bg-slate-900">
            <ArrowLeft size={16} /> Quay lại
          </Button>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <PackagePlus size={20} className="text-blue-600" /> Tạo Yêu cầu Xuất lẻ
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} isLoading={loading} className="bg-white">
            <Save size={16} /> Lưu Nháp
          </Button>
          <Button onClick={() => handleSave(true)} isLoading={loading} className="px-6 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
            <CheckCircle size={16} /> Lưu & Xác nhận
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-6">
                <SearchableSelect
                  label="Lệnh xuất vật tư ERP (*)"
                  value={formData.idLenhXuatVT}
                  options={dsLenhXuat}
                  getValue={lx => lx.ID_LenhXuatVT}
                  getLabel={getLenhXuatLabel}
                  placeholder="Nhập để tìm lệnh xuất..."
                  onChange={handleLenhXuatChange}
                  wrapperClass="lg:col-span-3"
                />



                <SearchableSelect
                  label="Công đoạn lẻ (*)"
                  value={formData.idCongDoanLe}
                  options={dsCongDoan}
                  getValue={cd => cd.ID_CongDoanLe}
                  getLabel={getCongDoanLabel}
                  placeholder="Nhập để tìm công đoạn..."
                  onChange={cd => setFormData({ ...formData, idCongDoanLe: cd.ID_CongDoanLe })}
                  wrapperClass="lg:col-span-3"
                />

                <SearchableSelect
                  label="Bộ phận nhận"
                  value={formData.idBoPhanNhan}
                  options={dsBoPhan}
                  getValue={bp => bp.ID_BoPhan}
                  getLabel={getBoPhanLabel}
                  placeholder="Nhập để tìm bộ phận..."
                  onChange={bp => setFormData({ ...formData, idBoPhanNhan: bp.ID_BoPhan })}
                  wrapperClass="lg:col-span-3"
                />

                <Input
                  type="date"
                  label="Ngày yêu cầu"
                  value={formData.ngayYeuCau}
                  disabled
                  wrapperClass="lg:col-span-2"
                />
                <Input
                  type="date"
                  label="Ngày dự kiến xuất"
                  value={formData.ngayDuKienXuat}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setFormData({ ...formData, ngayDuKienXuat: e.target.value })}
                  wrapperClass="lg:col-span-2"
                />
                <Input
                  type="date"
                  label="Hạn hoàn thành"
                  value={formData.deadlineHoanThanh}
                  min={formData.ngayDuKienXuat || new Date().toISOString().slice(0, 10)}
                  onChange={e => setFormData({ ...formData, deadlineHoanThanh: e.target.value })}
                  wrapperClass="lg:col-span-2"
                />

                <Input
                  label="Ghi chú"
                  value={formData.ghiChu}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                  wrapperClass="lg:col-span-6"
                />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-4 dark:border-white/10">
              <div>
                <CardTitle>Danh sách vật tư xuất</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Danh sách sẽ tự động hiển thị sau khi bạn chọn Lệnh xuất vật tư ERP.</p>
              </div>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col overflow-hidden p-0">
              <TableContainer className="h-full max-h-[600px] overflow-y-auto rounded-none border-0">
                <Table>
                  <thead>
                    <tr>
                      <th className="w-8 border-b bg-slate-50 dark:border-white/10 dark:bg-slate-950"></th>
                      <th className="min-w-[150px] border-b bg-slate-50">Mã vật tư</th>
                      <th className="min-w-[250px] border-b bg-slate-50">Tên vật tư</th>
                      <th className="min-w-[100px] border-b bg-slate-50">ĐVT</th>
                      <th className="min-w-[250px] border-b bg-slate-50">Phiếu nhập BTP</th>
                      <th className="border-b bg-slate-50 text-right">SL BTP</th>
                      <th className="border-b bg-slate-50 text-right">SL ERP</th>
                      <th className="border-b bg-slate-50 text-right">SL Đã xuất</th>
                      <th style={{ width: 140 }} className="border-b bg-slate-50 text-right">SL Xuất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsVatTu.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                            <PackagePlus size={48} className="mb-4 opacity-20" />
                            <p>Chưa có dữ liệu. Vui lòng chọn Lệnh xuất ở trên.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dsVatTu.map((vt, index) => {
                        return (
                          <motion.tr
                            key={vt.__rowId}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                          >
                            <td className="text-center">
                              <button
                                onClick={() => handleRemoveVatTu(index)}
                                className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                title="Xóa dòng"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                            <td className="text-sm font-medium">{vt.Ma_VatTu || '-'}</td>
                            <td className="text-sm text-slate-900 dark:text-white line-clamp-2" title={vt.Ten_VatTu}>
                              {vt.Ten_VatTu || '-'}
                            </td>
                            <td className="text-sm text-slate-500">{vt.Ten_DonViTinh || '-'}</td>
                            <td className="p-2">
                              <SearchableSelect
                                value={`${vt.idPhieuNhapBTP_Source}-${vt.idDonHang_Source}-${vt.idDonHangLoSanXuat_Source}-${vt.idDonHangSanPham_Source}`}
                                options={dsPhieuNhapBTP}
                                getValue={p => `${p.ID_PhieuNhapBTP}-${p.ID_DonHang}-${p.ID_DonHang_LoSanXuat}-${p.ID_DonHang_SanPham}`}
                                getLabel={getPhieuNhapLabel}
                                placeholder="Chọn BTP..."
                                onChange={(phieu) => handlePhieuNhapRowChange(index, phieu)}
                                className="h-8 text-xs"
                              />
                            </td>
                            <td className="text-right text-sm font-medium text-emerald-600">
                              {vt.idPhieuNhapBTP_Source ? (
                                dsPhieuNhapBTP.find(p =>
                                  p.ID_PhieuNhapBTP === vt.idPhieuNhapBTP_Source &&
                                  p.ID_DonHang === vt.idDonHang_Source &&
                                  p.ID_DonHang_LoSanXuat === vt.idDonHangLoSanXuat_Source &&
                                  p.ID_DonHang_SanPham === vt.idDonHangSanPham_Source
                                )?.SoLuong_ConLai ?? '-'
                              ) : '-'}
                            </td>
                            <td className="text-right text-sm text-slate-500">{vt.SoLuong_DeNghi ?? '-'}</td>
                            <td className="text-right text-sm text-slate-400 italic">
                              {vt.idPhieuNhapBTP_Source ? (
                                dsPhieuNhapBTP.find(p =>
                                  p.ID_PhieuNhapBTP === vt.idPhieuNhapBTP_Source &&
                                  p.ID_DonHang === vt.idDonHang_Source &&
                                  p.ID_DonHang_LoSanXuat === vt.idDonHangLoSanXuat_Source &&
                                  p.ID_DonHang_SanPham === vt.idDonHangSanPham_Source
                                )?.TongSL_DaXuat ?? 0
                              ) : 0}
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                min="0"
                                value={vt.SoLuong_DeNghi_Xuat}
                                onChange={(e) => handleSoLuongChange(index, e.target.value)}
                                className="h-8 px-2 py-1 text-right font-medium text-blue-700"
                              />
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
