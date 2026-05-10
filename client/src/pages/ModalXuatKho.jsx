import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { Table, TableContainer } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import dmApi from '../api/dmApi';

export default function ModalXuatKho({ isOpen, onClose, data, onSubmit, loading }) {
  const [chiTiet, setChiTiet] = useState([]);
  const [ghiChu, setGhiChu] = useState('');
  const [idKhoXuat, setIdKhoXuat] = useState('');
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
      // Khởi tạo state với số lượng xuất mặc định là số lượng đề nghị còn lại
      setChiTiet(data.map(item => {
        const conLai = (item.SoLuong_DeNghi_Xuat || 0) - (item.SoLuong_DaXuat || 0);
        return {
          ...item,
          soLuongXuat: conLai > 0 ? conLai : 0
        };
      }));
      setGhiChu('');
      // Ưu tiên kho 17 nếu có trong list
      setIdKhoXuat('17');
    }
  }, [isOpen, data]);

  const handleSoLuongChange = (idDong, value) => {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;

    setChiTiet(prev => prev.map(item => {
      if (item.ID_Dong === idDong) {
        // Tối đa là số lượng đề nghị còn lại
        const maxAllow = (item.SoLuong_DeNghi_Xuat || 0) - (item.SoLuong_DaXuat || 0);
        if (num > maxAllow) num = maxAllow;
        return { ...item, soLuongXuat: num };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!idKhoXuat) {
      alert('Vui lòng chọn kho xuất');
      return;
    }

    const payload = chiTiet
      .filter(item => item.soLuongXuat > 0)
      .map(item => ({
        idDong: item.ID_Dong,
        soLuongXuat: item.soLuongXuat
      }));

    onSubmit(idKhoXuat, payload, ghiChu);
  };

  const totalXuat = chiTiet.reduce((sum, item) => sum + item.soLuongXuat, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lập phiếu xuất kho"
      size="lg"
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-500 mb-2">
          Hệ thống sẽ lập phiếu xuất kho ERP dựa trên lệnh đã có sẵn.
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Kho xuất <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={idKhoXuat}
            onChange={(e) => setIdKhoXuat(e.target.value)}
          >
            <option value="">-- Chọn kho xuất --</option>
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
                <th className="text-right">Đề nghị</th>
                <th className="text-right">Đã xuất</th>
                <th className="text-right w-32">SL Xuất</th>
              </tr>
            </thead>
            <tbody>
              {chiTiet.map(vt => {
                const conLai = (vt.SoLuong_DeNghi_Xuat || 0) - (vt.SoLuong_DaXuat || 0);
                return (
                  <tr key={vt.ID_Dong}>
                    <td className="font-semibold">{vt.Ma_VatTu}</td>
                    <td className="text-right text-slate-500">{vt.SoLuong_DeNghi_Xuat}</td>
                    <td className="text-right text-blue-600 font-medium">{vt.SoLuong_DaXuat}</td>
                    <td className="text-right">
                      <Input
                        type="number"
                        min="0"
                        max={conLai > 0 ? conLai : 0}
                        value={vt.soLuongXuat === 0 ? '' : vt.soLuongXuat}
                        placeholder="0"
                        onChange={(e) => handleSoLuongChange(vt.ID_Dong, e.target.value)}
                        disabled={conLai <= 0}
                        className="text-right text-blue-600 font-bold"
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
            placeholder="Nhập ghi chú xuất kho (nếu có)..."
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
            disabled={totalXuat <= 0 || !idKhoXuat}
          >
            Xác nhận lập Phiếu xuất
          </Button>
        </div>
      </div>
    </Modal>
  );
}
