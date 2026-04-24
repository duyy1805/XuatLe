import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableContainer } from '../components/ui/Table';
import { Save, ArrowLeft, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import sourceApi from '../api/sourceApi';
import dmApi from '../api/dmApi';
import yeuCauApi from '../api/yeuCauApi';

export default function YeuCauCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dsKeHoach, setDsKeHoach] = useState([]);
  const [dsCongDoan, setDsCongDoan] = useState([]);
  const [dsVatTu, setDsVatTu] = useState([]);
  const [loadingVatTu, setLoadingVatTu] = useState(false);
  const [selectedKeHoach, setSelectedKeHoach] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    idCongDoanLe: '',
    idBoPhanNguon: '3', // Default
    idNhaCungCap: '1', // Default
    ngayYeuCau: new Date().toISOString().slice(0, 10),
    ngayDuKienXuat: '',
    deadlineHoanThanh: '',
    ghiChu: ''
  });

  useEffect(() => {
    // Load options
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

  const handleAddKeHoach = async () => {
    if (!selectedKeHoach) {
      toast.warning('Vui lòng chọn kế hoạch sản xuất để tải vật tư');
      return;
    }

    const selectedKh = dsKeHoach.find(k => k.ID_KeHoachSanXuat.toString() === selectedKeHoach);
    if (!selectedKh) return;

    // Check if already added
    if (dsVatTu.some(vt => vt.ID_KeHoachSanXuat.toString() === selectedKeHoach)) {
      toast.warning('Vật tư của kế hoạch này đã được thêm vào danh sách');
      return;
    }

    setLoadingVatTu(true);
    try {
      const res = await sourceApi.getVatTu(selectedKeHoach, selectedKh?.ID_DonHangSanPham);
      if (res.success) {
        if (res.data.length === 0) {
          toast.info('Kế hoạch này không có vật tư nào để xuất');
        } else {
          const vtList = res.data.map(vt => ({
            ...vt,
            ID_KeHoachSanXuat: selectedKh.ID_KeHoachSanXuat,
            ID_LenhSanXuat: selectedKh.ID_LenhSanXuat,
            ID_DonHang: selectedKh.ID_DonHang,
            ID_DonHang_SanPham: selectedKh.ID_DonHang_SanPham,
            ID_DonHang_LoSanXuat: selectedKh.ID_DonHang_LoSanXuat || null,
            Ma_VatTu_SP: selectedKh.Ma_VatTu,
            Ten_VatTu_SP: selectedKh.Ten_VatTu,
            So_LenhSanXuat: selectedKh.So_LenhSanXuat,
            SoLuong_DeNghi_Xuat: vt.SoLuongConLai > 0 ? vt.SoLuongConLai : 0,
            GhiChu_ChiTiet: ''
          }));
          setDsVatTu(prev => [...prev, ...vtList]);
          toast.success(`Đã tải ${vtList.length} vật tư từ lệnh ${selectedKh.So_LenhSanXuat}`);
        }
      }
    } catch {
      toast.error('Không thể tải danh sách vật tư');
    } finally {
      setLoadingVatTu(false);
      setSelectedKeHoach('');
    }
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

    const chiTietToSave = dsVatTu.filter(vt => vt.SoLuong_DeNghi_Xuat > 0);
    if (chiTietToSave.length === 0) {
      toast.warning("Vui lòng thêm vật tư và nhập số lượng đề nghị xuất!");
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
        toast.success("Tạo yêu cầu thành công!");
        navigate(`/yeu-cau/${res.data.ID_XuatLe_YeuCau}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Lỗi lưu nháp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between glass p-4 rounded-[var(--radius-xl)]">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white">
            <ArrowLeft size={16} /> Quay lại
          </Button>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
            <PackagePlus size={20} className="text-primary" /> Tạo Yêu cầu Xuất lẻ (Nhiều Kế hoạch)
          </h2>
        </div>
        <Button onClick={handleSaveDraft} isLoading={loading} className="px-6 shadow-glow">
          <Save size={16} /> Lưu Nháp
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-5">
                <Select
                  label="Công đoạn lẻ (*)"
                  value={formData.idCongDoanLe}
                  onChange={e => setFormData({ ...formData, idCongDoanLe: e.target.value })}
                >
                  <option value="">-- Chọn Công đoạn --</option>
                  {dsCongDoan.map(cd => (
                    <option key={cd.ID_CongDoanLe} value={cd.ID_CongDoanLe}>
                      {cd.Ma_CongDoanLe} - {cd.Ten_CongDoanLe}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <Input
                  label="Ghi chú"
                  value={formData.ghiChu}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-end gap-4 border-b pb-4">
              <div className="flex-1 max-w-md">
                <Select
                  label="Thêm vật tư từ Kế hoạch sản xuất"
                  value={selectedKeHoach}
                  onChange={e => setSelectedKeHoach(e.target.value)}
                >
                  <option value="">-- Chọn Kế hoạch cần thêm --</option>
                  {dsKeHoach.map(kh => (
                    <option key={kh.ID_KeHoachSanXuat} value={kh.ID_KeHoachSanXuat}>
                      {kh.So_LenhSanXuat} - {kh.ID_KeHoachSanXuat}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleAddKeHoach} isLoading={loadingVatTu} className="shrink-0 mb-1">
                <Plus size={16} /> Thêm vật tư
              </Button>
            </CardHeader>
            <CardBody className="flex-1 overflow-hidden flex flex-col p-0">
              <TableContainer className="border-0 rounded-none h-full max-h-[600px] overflow-y-auto">
                <Table>
                  <thead>
                    <tr>
                      <th className="bg-slate-50 border-b w-8"></th>
                      <th className="bg-slate-50 border-b">Lệnh SX</th>
                      <th className="bg-slate-50 border-b">Mã VT</th>
                      <th className="bg-slate-50 border-b">Tên VT</th>
                      <th className="bg-slate-50 border-b text-right">Số lượng kế hoạch</th>
                      <th className="bg-slate-50 border-b text-right">Còn lại</th>
                      <th style={{ width: 130 }} className="bg-slate-50 border-b text-right">Đề nghị xuất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsVatTu.length === 0 ? (
                      <tr>
                        <td colSpan="7">
                          <div className="flex flex-col items-center justify-center py-20 text-muted">
                            <PackagePlus size={48} className="mb-4 opacity-20" />
                            <p>Chưa có vật tư nào. Vui lòng chọn Kế hoạch sản xuất ở trên để thêm.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dsVatTu.map((vt, index) => (
                        <tr key={`${vt.ID_KeHoachSanXuat}-${vt.ID_VatTu}`}>
                          <td className="text-center">
                            <button
                              onClick={() => handleRemoveVatTu(index)}
                              className="text-muted hover:text-danger p-1 rounded hover:bg-danger-bg transition-colors"
                              title="Xóa dòng"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                          <td className="font-medium text-[var(--primary)] whitespace-nowrap">{vt.So_LenhSanXuat}</td>
                          <td className="font-semibold whitespace-nowrap">{vt.Ma_VatTu}</td>
                          <td className="truncate max-w-[150px]" title={vt.Ten_VatTu}>{vt.Ten_VatTu}</td>
                          <td className="text-right">{vt.SoLuong_KeHoach}</td>
                          <td className="text-right font-medium text-success">{vt.SoLuongConLai}</td>
                          <td className="text-right p-2">
                            <Input
                              type="number"
                              min="0"
                              value={vt.SoLuong_DeNghi_Xuat}
                              onChange={(e) => handleSoLuongChange(index, e.target.value)}
                              className="text-right py-1 h-8 px-2"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
