import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, CheckCircle, Send, XCircle, Box, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import yeuCauApi from '../api/yeuCauApi';
import { format } from 'date-fns';

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

  const fetchDetail = useCallback(async () => {
    try {
      const res = await yeuCauApi.getById(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      const res = await yeuCauApi.getById(id);
      if (!ignore && res.success) {
        setData(res.data);
        setLoading(false);
      }
    }
    startFetching();
    return () => {
      ignore = true;
    };
  }, [id]);

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
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
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
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/30 bg-white/70 p-6 backdrop-blur-md md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/yeu-cau')} className="bg-white">
              <ArrowLeft size={16} />
            </Button>
            <Badge variant={STATUS_MAP[header.TrangThai]?.variant || 'neutral'} className="text-sm px-3 py-1">
              {STATUS_MAP[header.TrangThai]?.label || header.TrangThai}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Yêu cầu xuất lẻ #{header.ID_XuatLe_YeuCau}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-slate-500">
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


          {(header.TrangThai === 0 || header.TrangThai === 1) && (
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={() => handleAction('cancel', 'Huỷ')} isLoading={actionLoading}>
              Huỷ YC
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vật tư xuất</CardTitle>
            </CardHeader>
            <CardBody>
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
                <div className="mt-0.5 text-slate-500"><Box size={18} /></div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Công đoạn lẻ</div>
                  <div className="mt-0.5 font-semibold text-slate-900">{header.Ten_CongDoanLe}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 text-slate-500"><User size={18} /></div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Người tạo</div>
                  <div className="mt-0.5 font-semibold text-slate-900">{header.TaiKhoan_Lap}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}