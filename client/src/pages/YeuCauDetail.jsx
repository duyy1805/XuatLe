import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, CheckCircle, Box, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import yeuCauApi from '../api/yeuCauApi';
import { format } from 'date-fns';
import ModalNhapLai from './ModalNhapLai';
import { Modal } from '../components/ui/Modal';
import { Eye } from 'lucide-react';

const STATUS_MAP = {
  0: { label: 'Nháp', variant: 'neutral' },
  1: { label: 'Đang chờ duyệt', variant: 'warning' },
  2: { label: 'Chờ tạo lệnh ERP', variant: 'info' },
  3: { label: 'Đã tạo lệnh ERP', variant: 'primary' },
  4: { label: 'Đang xuất kho', variant: 'primary' },
  5: { label: 'Đã xuất đủ', variant: 'primary' },
  6: { label: 'Đang nhập lại', variant: 'primary' },
  7: { label: 'Hoàn thành', variant: 'success' },
  8: { label: 'Quá hạn', variant: 'danger' },
  9: { label: 'Đã hủy', variant: 'danger' }
};

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

export default function YeuCauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isNhapLaiModalOpen, setIsNhapLaiModalOpen] = useState(false);
  const [nhapLaiLoading, setNhapLaiLoading] = useState(false);

  const [phieuXuatList, setPhieuXuatList] = useState([]);
  const [phieuNhapList, setPhieuNhapList] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'receipts'

  const [receiptItemsModal, setReceiptItemsModal] = useState({ isOpen: false, type: null, data: null, items: [] });
  const [receiptItemsLoading, setReceiptItemsLoading] = useState(false);

  const fetchReceipts = useCallback(async () => {
    try {
      setReceiptsLoading(true);
      const [resXuat, resNhap] = await Promise.all([
        yeuCauApi.getPhieuXuat(id),
        yeuCauApi.getPhieuNhap(id)
      ]);
      if (resXuat.success) setPhieuXuatList(resXuat.data);
      if (resNhap.success) setPhieuNhapList(resNhap.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu:', error);
    } finally {
      setReceiptsLoading(false);
    }
  }, [id]);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await yeuCauApi.getById(id);
      if (res.success) {
        setData(res.data);
        fetchReceipts();
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [id, fetchReceipts]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleAction = async (action, actionName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận thao tác',
      message: `Bạn có chắc chắn muốn ${actionName.toLowerCase()}?`,
      confirmText: actionName,
      variant: action === 'reject' || action === 'cancel' ? 'danger' : 'primary'
    });

    if (!isConfirmed) return;

    try {
      setActionLoading(true);
      let res;
      switch (action) {
        case 'submit':
          res = await yeuCauApi.submit(id);
          break;
        case 'cancel':
          res = await yeuCauApi.cancel(id, { lyDo: 'Huỷ yêu cầu' });
          break;
        case 'createLenh':
          res = await yeuCauApi.createLenhXuat(id, {
            idHinhThucXuatVT: 9,
            idKhoXuat: 17,
            idLuongQT: 2,
            lyDoXuat: 'Xuất theo yêu cầu ' + id,
            chiTiet: data.chiTiet.map(item => ({
              ID_DonHang_VatTu: item.ID_DonHang_VatTu,
              ID_VatTu: item.ID_VatTu,
              DinhMuc_VatTu: item.DinhMuc_VatTu || 0,
              SoLuong_VatTu: item.SoLuong_DeNghi_Xuat
            }))
          });
          break;
      }

      if (res.success) {
        toast.success(`${actionName} thành công!`);
        fetchDetail();
      }
    } catch (error) {
      toast.error(error.message || `Lỗi ${actionName}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNhapLaiSubmit = async (idKhoNhap, payload, ghiChu) => {
    try {
      setNhapLaiLoading(true);
      const res = await yeuCauApi.nhapLai(id, { idKhoNhap, chiTiet: payload, ghiChu });
      if (res.success) {
        toast.success('Nhập lại vật tư thành công!');
        setIsNhapLaiModalOpen(false);
        fetchDetail();
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện nhập lại');
    } finally {
      setNhapLaiLoading(false);
    }
  };

  const handleViewReceiptItems = async (type, receipt) => {
    try {
      setReceiptItemsModal({ isOpen: true, type, data: receipt, items: [] });
      setReceiptItemsLoading(true);
      const res = type === 'xuat'
        ? await yeuCauApi.getPhieuXuatDetail(receipt.ID_PhieuXuatVT)
        : await yeuCauApi.getPhieuNhapDetail(receipt.ID_PhieuNhapVT);

      if (res.success) {
        setReceiptItemsModal(prev => ({ ...prev, items: res.data }));
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết phiếu:', error);
      toast.error('Không thể tải chi tiết vật tư của phiếu');
    } finally {
      setReceiptItemsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2 h-96"><CardBody><Skeleton className="h-full w-full mt-4" /></CardBody></Card>
          <Card className="h-96"><CardBody><Skeleton className="h-full w-full mt-4" /></CardBody></Card>
        </div>
      </div>
    );
  }

  if (!data || !data.header) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <p>Không tìm thấy dữ liệu yêu cầu</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/yeu-cau')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const { header, chiTiet } = data;

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header Layout */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/30 bg-white/70 p-6 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/yeu-cau')} className="bg-white dark:bg-slate-900">
              <ArrowLeft size={16} />
            </Button>
            <Badge variant={STATUS_MAP[header.TrangThai]?.variant || 'neutral'} className="text-sm px-3 py-1">
              {STATUS_MAP[header.TrangThai]?.label || header.TrangThai}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Yêu cầu xuất lẻ #{header.ID_XuatLe_YeuCau}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Calendar size={14} /> {header.NgayYeuCau ? format(new Date(header.NgayYeuCau), 'dd/MM/yyyy HH:mm') : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(header.TrangThai === 0 || header.TrangThai === 1) && (
            <Button onClick={() => handleAction('submit', 'Xác nhận')} isLoading={actionLoading}>
              <CheckCircle size={16} /> Xác nhận
            </Button>
          )}

          {header.TrangThai === 2 && (
            <Button variant="primary" onClick={() => handleAction('createLenh', 'Tạo lệnh xuất ERP')} isLoading={actionLoading}>
              <Box size={16} /> Tạo Lệnh ERP
            </Button>
          )}

          {[4, 5, 6].includes(header.TrangThai) && (
            <Button variant="primary" onClick={() => setIsNhapLaiModalOpen(true)}>
              <Box size={16} /> Nhập lại vật tư
            </Button>
          )}


          {(header.TrangThai === 0 || header.TrangThai === 1) && (
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleAction('cancel', 'Huỷ')} isLoading={actionLoading}>
              Huỷ YC
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          {/* New Receipts Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`text-lg font-bold pb-1 border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Tổng hợp vật tư
                </button>
                <button
                  onClick={() => setActiveTab('receipts')}
                  className={`text-lg font-bold pb-1 border-b-2 transition-colors ${activeTab === 'receipts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Lịch sử Giao nhận ({phieuXuatList.length + phieuNhapList.length})
                </button>
              </div>
              {/* <Button variant="ghost" size="sm" onClick={fetchReceipts} isLoading={receiptsLoading}>
                Làm mới
              </Button> */}
            </CardHeader>
            <CardBody>
              {activeTab === 'summary' ? (
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <th>Lệnh SX</th>
                        <th>Mã VT</th>
                        <th className="text-right">Đề nghị</th>
                        <th className="text-right">Đã xuất</th>
                        <th className="text-right">Đã nhập</th>
                        <th className="text-right">Hao hụt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chiTiet.map((vt) => (
                        <tr key={vt.ID_Dong}>
                          <td className="font-medium text-blue-600">{vt.So_LenhSanXuat || '-'}</td>
                          <td className="font-semibold">{vt.Ma_VatTu}</td>
                          <td className="text-right">{vt.SoLuong_DeNghi_Xuat}</td>
                          <td className="text-right font-medium text-blue-600">{vt.SoLuong_DaXuat}</td>
                          <td className="text-right font-medium text-emerald-600">{vt.SoLuong_DaNhap}</td>
                          <td className="text-right text-red-600">{vt.SoLuong_HaoHut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> Phiếu Xuất kho ({phieuXuatList.length})
                    </h4>
                    <TableContainer>
                      <Table>
                        <thead>
                          <tr>
                            <th>Số phiếu ERP</th>
                            <th>Ngày xuất</th>
                            <th className="text-right">Tổng SL</th>
                            <th>Kho xuất</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phieuXuatList.length > 0 ? phieuXuatList.map((px) => (
                            <tr key={px.ID_XuatLe_PhieuXuat_Map}>
                              <td className="font-bold text-blue-600">
                                <button
                                  onClick={() => handleViewReceiptItems('xuat', px)}
                                  className="flex items-center gap-1 hover:underline"
                                >
                                  {px.So_PhieuXuatVT} <Eye size={12} />
                                </button>
                              </td>
                              <td>{px.Ngay_XuatVT ? format(new Date(px.Ngay_XuatVT), 'dd/MM/yyyy') : '-'}</td>
                              <td className="text-right font-semibold">{px.SoLuong_Xuat}</td>
                              <td><Badge variant="neutral">{px.Ten_KhoXuat}</Badge></td>
                              <td className="text-xs text-slate-500">{px.GhiChu || '-'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="text-center py-4 text-slate-400">Chưa có phiếu xuất</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Phiếu Nhập kho ({phieuNhapList.length})
                    </h4>
                    <TableContainer>
                      <Table>
                        <thead>
                          <tr>
                            <th>Số phiếu ERP</th>
                            <th>Ngày nhập</th>
                            <th className="text-right">Tổng SL</th>
                            <th>Kho nhập</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phieuNhapList.length > 0 ? phieuNhapList.map((pn) => (
                            <tr key={pn.ID_XuatLe_PhieuNhap_Map}>
                              <td className="font-bold text-emerald-600">
                                <button
                                  onClick={() => handleViewReceiptItems('nhap', pn)}
                                  className="flex items-center gap-1 hover:underline"
                                >
                                  {pn.So_PhieuNhapVT || 'Đang chờ...'} <Eye size={12} />
                                </button>
                              </td>
                              <td>{pn.Ngay_NhapVT ? format(new Date(pn.Ngay_NhapVT), 'dd/MM/yyyy') : '-'}</td>
                              <td className="text-right font-semibold">{pn.SoLuong_Nhap}</td>
                              <td><Badge variant="neutral">{pn.Ten_KhoNhap}</Badge></td>
                              <td className="text-xs text-slate-500">{pn.GhiChu || '-'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="text-center py-4 text-slate-400">Chưa có phiếu nhập</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-5">
              <div className="flex gap-3">
                <div className="mt-0.5 text-slate-500 dark:text-slate-400"><Box size={18} /></div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Công đoạn lẻ</div>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{header.Ten_CongDoanLe}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 text-slate-500 dark:text-slate-400"><User size={18} /></div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Bộ phận nhận</div>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{header.Ten_BoPhan_Nhan || '-'}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 text-slate-500 dark:text-slate-400"><User size={18} /></div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Người tạo</div>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{header.TaiKhoan_Lap}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Modal chi tiết phiếu */}
      <Modal
        isOpen={receiptItemsModal.isOpen}
        onClose={() => setReceiptItemsModal(prev => ({ ...prev, isOpen: false }))}
        title={`Chi tiết vật tư: ${receiptItemsModal.data?.So_PhieuXuatVT || receiptItemsModal.data?.So_PhieuNhapVT || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b pb-4 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Người giao/nhận</p>
              <p className="font-medium">{receiptItemsModal.data?.NguoiNhanHang || receiptItemsModal.data?.NguoiGiaoHang || '-'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Ngày thực hiện</p>
              <p className="font-medium">
                {receiptItemsModal.data?.Ngay_XuatVT || receiptItemsModal.data?.Ngay_NhapVT
                  ? format(new Date(receiptItemsModal.data?.Ngay_XuatVT || receiptItemsModal.data?.Ngay_NhapVT), 'dd/MM/yyyy HH:mm')
                  : '-'}
              </p>
            </div>
          </div>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Mã vật tư</th>
                  <th>Tên vật tư</th>
                  <th>ĐVT</th>
                  <th className="text-right">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {receiptItemsLoading ? (
                  <tr><td colSpan={4} className="text-center py-8"><Skeleton className="h-4 w-full" /></td></tr>
                ) : receiptItemsModal.items.length > 0 ? (
                  receiptItemsModal.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{item.Ma_VatTu}</td>
                      <td className="text-sm">{item.Ten_VatTu}</td>
                      <td>{item.Ten_DonViTinh}</td>
                      <td className="text-right font-bold text-blue-600">
                        {receiptItemsModal.type === 'xuat' ? item.SoLuong_XuatKho : item.SoLuong_NhapKho}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-4 text-slate-400">Không có dữ liệu chi tiết</td></tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm italic text-slate-600">
            <strong>Ghi chú:</strong> {receiptItemsModal.data?.GhiChu || 'Không có ghi chú'}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setReceiptItemsModal(prev => ({ ...prev, isOpen: false }))}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      <ModalNhapLai
        isOpen={isNhapLaiModalOpen}
        onClose={() => setIsNhapLaiModalOpen(false)}
        data={chiTiet}
        onSubmit={handleNhapLaiSubmit}
        loading={nhapLaiLoading}
      />
    </motion.div>
  );
}