import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, CheckCircle, Box, Calendar, User, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../contexts/AuthContext';
import yeuCauApi from '../api/yeuCauApi';
import { format } from 'date-fns';
import ModalNhapLai from './ModalNhapLai';
import ModalXuatKho from './ModalXuatKho';
import { Modal } from '../components/ui/Modal';

const STATUS_MAP = {
  0: { label: 'Nháp', variant: 'neutral' },
  1: { label: 'Chờ duyệt', variant: 'warning' },
  2: { label: 'Chờ liên kết ERP', variant: 'info' },
  3: { label: 'Sẵn sàng xuất kho', variant: 'primary' },
  4: { label: 'Đang xuất kho', variant: 'primary' },
  5: { label: 'Đã xuất đủ', variant: 'success' },
  6: { label: 'Đang nhập lại', variant: 'warning' },
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

  const [lenhXuatList, setLenhXuatList] = useState([]);
  const [phieuXuatList, setPhieuXuatList] = useState([]);
  const [phieuNhapList, setPhieuNhapList] = useState([]);
  const [isXuatKhoModalOpen, setIsXuatKhoModalOpen] = useState(false);
  const [xuatKhoLoading, setXuatKhoLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'receipts'

  const { user } = useAuth();

  const [receiptItemsModal, setReceiptItemsModal] = useState({ isOpen: false, type: null, data: null, items: [] });
  const [receiptItemsLoading, setReceiptItemsLoading] = useState(false);

  const [itemHistoryModal, setItemHistoryModal] = useState({ isOpen: false, item: null, history: [] });
  const [itemHistoryLoading, setItemHistoryLoading] = useState(false);

  const fetchReceipts = useCallback(async () => {
    try {
      setReceiptsLoading(true);
      const [resLenh, resXuat, resNhap] = await Promise.all([
        yeuCauApi.getLenhXuat(id),
        yeuCauApi.getPhieuXuat(id),
        yeuCauApi.getPhieuNhap(id)
      ]);
      if (resLenh.success) setLenhXuatList(resLenh.data);
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
              ID_DonHang_VatTu: item.ID_DonHang_VatTu || 0,
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

  const handleXuatKhoSubmit = async (idKhoXuat, payload, ghiChu) => {
    try {
      setXuatKhoLoading(true);
      const res = await yeuCauApi.xuatKho(id, { idKhoXuat, chiTiet: payload, ghiChu });
      if (res.success) {
        toast.success('Lập phiếu xuất kho thành công!');
        setIsXuatKhoModalOpen(false);
        fetchDetail();
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện lập phiếu xuất');
    } finally {
      setXuatKhoLoading(false);
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

  const handleViewItemHistory = async (vt) => {
    try {
      setItemHistoryModal({ isOpen: true, item: vt, history: [] });
      setItemHistoryLoading(true);
      const res = await yeuCauApi.getItemHistory(id, {
        idVatTu: vt.ID_VatTu,
        idDonHangVatTu: vt.ID_DonHang_VatTu
      });
      if (res.success) {
        setItemHistoryModal(prev => ({ ...prev, history: res.data }));
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử vật tư:', error);
      toast.error('Không thể tải lịch sử nhập xuất của vật tư này');
    } finally {
      setItemHistoryLoading(false);
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
  const isCreator = user?.id === header?.TaiKhoan_Lap;

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
          {isCreator && (header.TrangThai === 0 || header.TrangThai === 1) && (
            <Button onClick={() => handleAction('submit', 'Xác nhận')} isLoading={actionLoading}>
              <CheckCircle size={16} /> Xác nhận
            </Button>
          )}

          {isCreator && header.TrangThai === 2 && !header.ID_LenhXuatVT && (
            <Button variant="primary" onClick={() => handleAction('createLenh', 'Tạo lệnh xuất ERP')} isLoading={actionLoading}>
              <Box size={16} /> Tạo Lệnh ERP
            </Button>
          )}
          
          {isCreator && (header.TrangThai === 3 || (header.TrangThai === 2 && header.ID_LenhXuatVT)) && (
            <Button variant="primary" onClick={() => setIsXuatKhoModalOpen(true)}>
              <Box size={16} /> Lập phiếu xuất kho
            </Button>
          )}

          {isCreator && [4, 5, 6].includes(header.TrangThai) && (
            <Button variant="primary" onClick={() => setIsNhapLaiModalOpen(true)}>
              <Box size={16} /> Nhập lại vật tư
            </Button>
          )}


          {isCreator && (header.TrangThai === 0 || header.TrangThai === 1) && (
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
                  Lịch sử Giao nhận ({lenhXuatList.length + phieuXuatList.length + phieuNhapList.length})
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
                        <th>Nguồn BTP</th>
                        <th className="text-right">Đề nghị</th>
                        <th className="text-right">Đã xuất</th>
                        <th className="text-right">Đã nhập</th>
                        <th className="text-right">Hao hụt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chiTiet.map((vt) => (
                        <tr
                          key={vt.ID_Dong}
                          onClick={() => handleViewItemHistory(vt)}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          title="Nhấn để xem chi tiết lịch sử nhập xuất của vật tư này"
                        >
                          <td className="font-medium text-blue-600">{vt.So_LenhSanXuat || '-'}</td>
                          <td className="font-semibold">{vt.Ma_VatTu}</td>
                          <td>
                            {vt.So_PhieuNhapBTP_Source ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-blue-600 text-xs">{vt.So_PhieuNhapBTP_Source}</span>
                                {vt.Ngay_NhapBTP_Source && (
                                  <span className="text-[10px] text-slate-500">
                                    {format(new Date(vt.Ngay_NhapBTP_Source), 'dd/MM/yyyy')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="text-right font-semibold">{vt.SoLuong_DeNghi_Xuat}</td>
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
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> Lệnh xuất vật tư ({lenhXuatList.length})
                    </h4>
                    <TableContainer>
                      <Table>
                        <thead>
                          <tr>
                            <th>Số lệnh ERP</th>
                            <th>Ngày lệnh</th>
                            <th>Trạng thái đồng bộ</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lenhXuatList.length > 0 ? lenhXuatList.map((lx) => (
                            <tr key={lx.ID_XuatLe_LenhXuat_Map}>
                              <td className="font-bold text-indigo-600">{lx.So_LenhXuatVT}</td>
                              <td>{lx.Ngay_LenhXuatVT ? format(new Date(lx.Ngay_LenhXuatVT), 'dd/MM/yyyy') : '-'}</td>
                              <td>
                                <Badge variant={lx.TrangThaiDongBo === 1 ? 'success' : 'warning'}>
                                  {lx.TrangThaiDongBo === 1 ? 'Đã đồng bộ' : 'Chờ đồng bộ'}
                                </Badge>
                              </td>
                              <td className="text-xs text-slate-500">{lx.GhiChu || '-'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="text-center py-4 text-slate-400">Chưa có lệnh xuất</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  </div>

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
                            <tr
                              key={px.ID_XuatLe_PhieuXuat_Map}
                              onClick={() => handleViewReceiptItems('xuat', px)}
                              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              title="Nhấn để xem chi tiết phiếu xuất"
                            >
                              <td className="font-bold text-blue-600">
                                <div className="flex items-center gap-1">
                                  {px.So_PhieuXuatVT}
                                </div>
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
                            <tr
                              key={pn.ID_XuatLe_PhieuNhap_Map}
                              onClick={() => handleViewReceiptItems('nhap', pn)}
                              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              title="Nhấn để xem chi tiết phiếu nhập"
                            >
                              <td className="font-bold text-emerald-600">
                                <div className="flex items-center gap-1">
                                  {pn.So_PhieuNhapVT || 'Đang chờ...'}
                                </div>
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
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{header.TenDayDu}</div>
                </div>
              </div>

              {lenhXuatList.length > 0 && (
                <div className="flex gap-3">
                  <div className="mt-0.5 text-slate-500 dark:text-slate-400"><ClipboardList size={18} /></div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Số lệnh xuất vật tư</div>
                    <div className="mt-0.5 flex flex-col gap-1">
                      {lenhXuatList.map(lx => (
                        <div key={lx.ID_XuatLe_LenhXuat_Map} className="font-bold text-indigo-600 dark:text-indigo-400">
                          {lx.So_LenhXuatVT}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

      {/* Modal Lịch sử nhập xuất của 1 vật tư */}
      <Modal
        isOpen={itemHistoryModal.isOpen}
        onClose={() => setItemHistoryModal(prev => ({ ...prev, isOpen: false }))}
        title={`Lịch sử Giao nhận: ${itemHistoryModal.item?.Ma_VatTu || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-white/5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{itemHistoryModal.item?.Ten_VatTu}</p>
            <p className="text-xs text-slate-500 mt-1">Lệnh SX: {itemHistoryModal.item?.So_LenhSanXuat || '-'}</p>
          </div>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Số phiếu ERP</th>
                  <th>Ngày</th>
                  <th className="text-right">Số lượng</th>
                  <th>Kho</th>
                </tr>
              </thead>
              <tbody>
                {itemHistoryLoading ? (
                  <tr><td colSpan={5} className="text-center py-8">Đang tải lịch sử...</td></tr>
                ) : itemHistoryModal.history.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Chưa có lịch sử giao nhận cho vật tư này</td></tr>
                ) : (
                  itemHistoryModal.history.map((h, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge variant={h.Loai === 'XUAT' ? 'primary' : 'success'}>
                          {h.Loai === 'XUAT' ? 'XUẤT' : 'NHẬP'}
                        </Badge>
                      </td>
                      <td className="font-medium">{h.SoPhieu}</td>
                      <td>{h.Ngay ? format(new Date(h.Ngay), 'dd/MM/yyyy HH:mm') : '-'}</td>
                      <td className="text-right font-bold">{h.SoLuong}</td>
                      <td>{h.TenKho}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setItemHistoryModal(prev => ({ ...prev, isOpen: false }))}>
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

      <ModalXuatKho
        isOpen={isXuatKhoModalOpen}
        onClose={() => setIsXuatKhoModalOpen(false)}
        data={chiTiet}
        onSubmit={handleXuatKhoSubmit}
        loading={xuatKhoLoading}
      />
    </motion.div>
  );
}