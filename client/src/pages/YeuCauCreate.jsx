import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableContainer } from '../components/ui/Table';
import { Save, ArrowLeft, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import sourceApi from '../api/sourceApi';
import dmApi from '../api/dmApi';
import yeuCauApi from '../api/yeuCauApi';

const createEmptyRow = () => ({
  __rowId: crypto.randomUUID(),
  ID_KeHoachSanXuat: '',
  ID_DonHang_SanPham: null,
  SoLuong_DeNghi_Xuat: 0,
  GhiChu_ChiTiet: ''
});

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
  value,
  options,
  getValue,
  getLabel,
  placeholder,
  disabled,
  onChange,
  className
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
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, query]);

  return (
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
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
      {isOpen && !disabled && createPortal(
        <div
          style={dropdownStyle}
          className="z-[9999] max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-xl"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <button
                key={getValue(option)}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
                className="block w-full px-3 py-2 text-left text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {getLabel(option)}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-slate-500">Không tìm thấy dữ liệu phù hợp</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function YeuCauCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dsKeHoach, setDsKeHoach] = useState([]);
  const [dsCongDoan, setDsCongDoan] = useState([]);
  const [dsVatTu, setDsVatTu] = useState([]);
  const [vatTuByKeHoach, setVatTuByKeHoach] = useState({});
  const [loadingRows, setLoadingRows] = useState({});

  const [formData, setFormData] = useState({
    idCongDoanLe: '',
    idBoPhanNguon: '3',
    idNhaCungCap: '1',
    ngayYeuCau: new Date().toISOString().slice(0, 10),
    ngayDuKienXuat: '',
    deadlineHoanThanh: '',
    ghiChu: ''
  });

  useEffect(() => {
    Promise.all([
      sourceApi.getKeHoach({}),
      dmApi.getCongDoanLe({})
    ]).then(([resKh, resCd]) => {
      if (resKh.success) setDsKeHoach(resKh.data);
      if (resCd.success) setDsCongDoan(resCd.data);
    }).catch(() => {
      toast.error('Lỗi tải dữ liệu danh mục');
    });
  }, []);

  const getKeHoachLabel = (kh) => {
    return [kh.So_LenhSanXuat, kh.Ma_VatTu, kh.Ten_VatTu, `KH#${kh.ID_KeHoachSanXuat}`]
      .filter(Boolean)
      .join(' - ');
  };

  const getVatTuLabel = (vt) => {
    return [vt.Ma_VatTu, vt.Ten_VatTu].filter(Boolean).join(' - ');
  };

  const loadVatTuForKeHoach = async (rowId, selectedKh) => {
    const key = selectedKh.ID_KeHoachSanXuat.toString();
    if (vatTuByKeHoach[key]) return vatTuByKeHoach[key];

    setLoadingRows(prev => ({ ...prev, [rowId]: true }));
    try {
      const res = await sourceApi.getVatTu(selectedKh.ID_KeHoachSanXuat, selectedKh?.ID_DonHangSanPham);
      if (res.success) {
        setVatTuByKeHoach(prev => ({ ...prev, [key]: res.data }));
        if (res.data.length === 0) {
          toast.info('Kế hoạch này không có vật tư nào để xuất');
        }
        return res.data;
      }
      return [];
    } catch {
      toast.error('Không thể tải danh sách vật tư');
      return [];
    } finally {
      setLoadingRows(prev => ({ ...prev, [rowId]: false }));
    }
  };

  const handleAddRow = () => {
    setDsVatTu(prev => [...prev, createEmptyRow()]);
  };

  const handleKeHoachChange = async (index, selectedKh) => {
    const rowId = dsVatTu[index].__rowId;
    setDsVatTu(prev => prev.map((row, rowIndex) => (
      rowIndex === index
        ? {
            ...createEmptyRow(),
            __rowId: row.__rowId,
            ID_KeHoachSanXuat: selectedKh.ID_KeHoachSanXuat,
            ID_LenhSanXuat: selectedKh.ID_LenhSanXuat,
            ID_DonHang: selectedKh.ID_DonHang,
            ID_DonHang_SanPham: selectedKh.ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat: selectedKh.ID_DonHang_LoSanXuat || null,
            Ma_VatTu_SP: selectedKh.Ma_VatTu,
            Ten_VatTu_SP: selectedKh.Ten_VatTu,
            So_LenhSanXuat: selectedKh.So_LenhSanXuat
          }
        : row
    )));
    await loadVatTuForKeHoach(rowId, selectedKh);
  };

  const handleVatTuChange = (index, selectedVt) => {
    setDsVatTu(prev => prev.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      return {
        ...row,
        ...selectedVt,
        SoLuong_DeNghi_Xuat: selectedVt.SoLuongConLai > 0 ? selectedVt.SoLuongConLai : 0,
        GhiChu_ChiTiet: row.GhiChu_ChiTiet || ''
      };
    }));
  };

  const handleSoLuongChange = (index, value) => {
    const newVatTu = [...dsVatTu];
    newVatTu[index].SoLuong_DeNghi_Xuat = Number(value);
    setDsVatTu(newVatTu);
  };

  const handleRemoveVatTu = (index) => {
    const newVatTu = [...dsVatTu];
    newVatTu.splice(index, 1);
    setDsVatTu(newVatTu);
  };

  const handleSaveDraft = async () => {
    if (!formData.idCongDoanLe) {
      toast.error('Vui lòng chọn Công đoạn lẻ!');
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
        ...formData,
        chiTiet: chiTietToSave.map((vt, idx) => ({
          idDong: idx + 1,
          idKeHoachSanXuat: vt.ID_KeHoachSanXuat,
          idLenhSanXuat: vt.ID_LenhSanXuat,
          idDonHang: vt.ID_DonHang,
          idDonHangSanPham: vt.ID_DonHang_SanPham,
          idDonHangLoSanXuat: vt.ID_DonHang_LoSanXuat,
          idDonHangVatTu: vt.ID_DonHang_VatTu,
          idVatTuXuat: vt.ID_VatTu,
          idVatTuNhap: vt.ID_VatTu,
          idDonViTinh: vt.ID_DonViTinh,
          soLuongKeHoach: vt.SoLuong_KeHoach,
          soLuongDeNghiXuat: vt.SoLuong_DeNghi_Xuat,
          donGiaTamTinh: 0,
          ghiChu: vt.GhiChu_ChiTiet
        }))
      };

      const res = await yeuCauApi.saveDraft(payload);
      if (res.success) {
        toast.success('Tạo yêu cầu thành công!');
        navigate(`/yeu-cau/${res.data.ID_XuatLe_YeuCau}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Lỗi lưu nháp');
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
      <motion.div variants={itemVariants} className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/70 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white">
            <ArrowLeft size={16} /> Quay lại
          </Button>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <PackagePlus size={20} className="text-blue-600" /> Tạo Yêu cầu Xuất lẻ
          </h2>
        </div>
        <Button onClick={handleSaveDraft} isLoading={loading} className="px-6 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
          <Save size={16} /> Lưu Nháp
        </Button>
      </motion.div>

      <div className="flex flex-col gap-6">
        <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
              <Select
                label="Công đoạn lẻ (*)"
                value={formData.idCongDoanLe}
                onChange={e => setFormData({ ...formData, idCongDoanLe: e.target.value })}
                wrapperClass="lg:col-span-2"
              >
                <option value="">-- Chọn Công đoạn --</option>
                {dsCongDoan.map(cd => (
                  <option key={cd.ID_CongDoanLe} value={cd.ID_CongDoanLe}>
                    {cd.Ma_CongDoanLe} - {cd.Ten_CongDoanLe}
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                label="Ngày yêu cầu (*)"
                value={formData.ngayYeuCau}
                onChange={e => setFormData({ ...formData, ngayYeuCau: e.target.value })}
              />
              <Input
                type="date"
                label="Hạn hoàn thành"
                value={formData.deadlineHoanThanh}
                onChange={e => setFormData({ ...formData, deadlineHoanThanh: e.target.value })}
              />

              <Input
                label="Ghi chú"
                value={formData.ghiChu}
                placeholder="Nhập ghi chú (không bắt buộc)"
                onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                wrapperClass="lg:col-span-4"
              />
            </div>
          </CardBody>
        </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-4">
              <div>
                <CardTitle>Danh sách vật tư đề nghị xuất</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Thêm từng dòng, chọn kế hoạch rồi chọn vật tư tương ứng trong kế hoạch đó.</p>
              </div>
              <Button onClick={handleAddRow} className="mb-1 shrink-0">
                <Plus size={16} /> Thêm dòng
              </Button>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col overflow-hidden p-0">
              <TableContainer className="h-full max-h-[600px] overflow-y-auto rounded-none border-0">
                <Table>
                  <thead>
                    <tr>
                      <th className="w-8 border-b bg-slate-50"></th>
                      <th className="min-w-[260px] border-b bg-slate-50">Kế hoạch</th>
                      <th className="min-w-[260px] border-b bg-slate-50">Vật tư</th>
                      <th className="border-b bg-slate-50 text-right">SL kế hoạch</th>
                      <th className="border-b bg-slate-50 text-right">Còn lại</th>
                      <th style={{ width: 130 }} className="border-b bg-slate-50 text-right">Đề nghị xuất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsVatTu.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <PackagePlus size={48} className="mb-4 opacity-20" />
                            <p>Chưa có dòng vật tư nào. Nhấn “Thêm dòng” để bắt đầu.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dsVatTu.map((vt, index) => {
                        const rowVatTuOptions = vatTuByKeHoach[vt.ID_KeHoachSanXuat?.toString()] || [];
                        const isLoadingRow = loadingRows[vt.__rowId];

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
                                className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Xóa dòng"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                            <td>
                              <SearchableSelect
                                value={vt.ID_KeHoachSanXuat}
                                options={dsKeHoach}
                                getValue={kh => kh.ID_KeHoachSanXuat}
                                getLabel={getKeHoachLabel}
                                placeholder="Nhập để lọc kế hoạch..."
                                onChange={(kh) => handleKeHoachChange(index, kh)}
                              />
                            </td>
                            <td>
                              <SearchableSelect
                                value={vt.ID_VatTu}
                                options={rowVatTuOptions}
                                getValue={item => item.ID_VatTu}
                                getLabel={getVatTuLabel}
                                placeholder={isLoadingRow ? 'Đang tải vật tư...' : 'Nhập để lọc vật tư...'}
                                disabled={!vt.ID_KeHoachSanXuat || isLoadingRow}
                                onChange={(item) => handleVatTuChange(index, item)}
                              />
                            </td>
                            <td className="text-right">{vt.SoLuong_KeHoach || '-'}</td>
                            <td className="text-right font-medium text-emerald-600">{vt.SoLuongConLai ?? '-'}</td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                min="0"
                                value={vt.SoLuong_DeNghi_Xuat}
                                onChange={(e) => handleSoLuongChange(index, e.target.value)}
                                className="h-8 px-2 py-1 text-right"
                                disabled={!vt.ID_VatTu}
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
