import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { Table, TableContainer } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import dmApi from '../api/dmApi';

export default function ModalNhapLai({ isOpen, onClose, data, onSubmit, loading }) {
  const [chiTiet, setChiTiet] = useState([]);
  const [ghiChu, setGhiChu] = useState('');
  const [idKhoNhap, setIdKhoNhap] = useState('');
  const [khoList, setKhoList] = useState([]);

  useEffect(() => {
    async function fetchKho() {
      try {
        const res = await dmApi.getKho();
        if (res.success) {
          setKhoList(res.data || []);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách kho', error);
      }
    }
    fetchKho();
  }, []);

  useEffect(() => {
    if (isOpen && data) {
      // Khởi tạo state với số lượng nhập lại mặc định là 0
      setChiTiet(data.map(item => ({
        ...item,
        soLuongNhapLai: 0
      })));
      setGhiChu('');
      setIdKhoNhap('');
    }
  }, [isOpen, data]);

  const handleSoLuongChange = (idDong, value) => {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;
    
    setChiTiet(prev => prev.map(item => {
      if (item.ID_Dong === idDong) {
        // Validation: SoLuong_NhapLai không được vượt quá số lượng còn có thể nhập (Đã xuất - Đã nhập - Hao hụt)
        const maxNhapLai = (item.SoLuong_DaXuat || 0) - (item.SoLuong_DaNhap || 0) - (item.SoLuong_HaoHut || 0);
        if (num > maxNhapLai) num = maxNhapLai;
        
        return { ...item, soLuongNhapLai: num };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!idKhoNhap) {
      alert('Vui lòng chọn kho nhập');
      return;
    }

    // Chỉ gửi những dòng có số lượng nhập lại > 0
    const payload = chiTiet
      .filter(item => item.soLuongNhapLai > 0)
      .map(item => ({
        idDong: item.ID_Dong,
        soLuongNhapLai: item.soLuongNhapLai
      }));
    
    onSubmit(idKhoNhap, payload, ghiChu);
  };

  const totalNhapLai = chiTiet.reduce((sum, item) => sum + item.soLuongNhapLai, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập lại vật tư"
      size="lg"
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-500 mb-2">
          Vui lòng chọn Kho nhập và nhập số lượng vật tư cần trả lại.
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Kho nhập <span className="text-red-500">*</span>
          </label>
          <select 
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={idKhoNhap} 
            onChange={(e) => setIdKhoNhap(e.target.value)}
          >
            <option value="">-- Chọn kho nhập --</option>
            {khoList.map(kho => (
              <option key={kho.ID_Kho} value={kho.ID_Kho}>
                {kho.Ma_Kho} - {kho.Ten_Kho}
              </option>
            ))}
          </select>
        </div>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Mã VT</th>
                <th className="text-right">Đã xuất</th>
                <th className="text-right">Đã nhập lại</th>
                <th className="text-right">Tối đa có thể trả</th>
                <th className="text-right w-32">SL Nhập lại</th>
              </tr>
            </thead>
            <tbody>
              {chiTiet.map(vt => {
                const maxNhapLai = (vt.SoLuong_DaXuat || 0) - (vt.SoLuong_DaNhap || 0) - (vt.SoLuong_HaoHut || 0);
                return (
                  <tr key={vt.ID_Dong}>
                    <td className="font-semibold">{vt.Ma_VatTu}</td>
                    <td className="text-right text-blue-600 font-medium">{vt.SoLuong_DaXuat}</td>
                    <td className="text-right text-emerald-600 font-medium">{vt.SoLuong_DaNhap}</td>
                    <td className="text-right text-slate-600 font-medium">{maxNhapLai > 0 ? maxNhapLai : 0}</td>
                    <td className="text-right">
                      <Input
                        type="number"
                        min="0"
                        max={maxNhapLai > 0 ? maxNhapLai : 0}
                        value={vt.soLuongNhapLai === 0 ? '' : vt.soLuongNhapLai}
                        placeholder="0"
                        onChange={(e) => handleSoLuongChange(vt.ID_Dong, e.target.value)}
                        disabled={maxNhapLai <= 0}
                        className="text-right"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ghi chú
          </label>
          <Input
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Nhập lý do trả lại vật tư..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Huỷ bỏ
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={loading}
            disabled={totalNhapLai <= 0 || !idKhoNhap}
          >
            Xác nhận tạo Phiếu nhập
          </Button>
        </div>
      </div>
    </Modal>
  );
}
