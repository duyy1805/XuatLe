import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, CheckCircle, Send, XCircle, RefreshCw, Box, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import yeuCauApi from '../api/yeuCauApi';
import { format } from 'date-fns';

const STATUS_MAP = {
  0: { label: 'Nháp', variant: 'neutral' },
  1: { label: 'Chờ duyệt', variant: 'warning' },
  2: { label: 'Đã duyệt', variant: 'success' },
  3: { label: 'Đã tạo lệnh', variant: 'info' },
  7: { label: 'Hoàn thành', variant: 'success' },
  9: { label: 'Đã huỷ', variant: 'danger' }
};

export default function YeuCauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        case 'approve':
          res = await yeuCauApi.approve(id, { isApprove: true });
          break;
        case 'reject':
          res = await yeuCauApi.approve(id, { isApprove: false, lyDo: 'Từ chối' });
          break;
        case 'cancel':
          res = await yeuCauApi.cancel(id, { lyDo: 'Huỷ yêu cầu' });
          break;
        case 'createLenh':
          res = await yeuCauApi.createLenhXuat(id, {
            idHinhThucXuatVT: 9,
            idKhoXuat: 17,
            lyDoXuat: 'Xuất theo yêu cầu ' + id
          });
          break;
        case 'syncXuat':
          res = await yeuCauApi.syncPhieuXuat(id);
          break;
        case 'syncNhap':
          res = await yeuCauApi.syncPhieuNhap(id);
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
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p>Không tìm thấy dữ liệu yêu cầu</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/yeu-cau')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const { header, chiTiet } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Premium Header Layout */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 glass p-6 rounded-[var(--radius-xl)]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/yeu-cau')} className="bg-white">
              <ArrowLeft size={16} />
            </Button>
            <Badge variant={STATUS_MAP[header.TrangThai]?.variant || 'neutral'} className="text-sm px-3 py-1">
              {STATUS_MAP[header.TrangThai]?.label || header.TrangThai}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
            Yêu cầu xuất lẻ #{header.ID_XuatLe_YeuCau}
          </h2>
          <p className="text-muted mt-1 flex items-center gap-2">
            <Calendar size={14} /> {header.NgayYeuCau ? format(new Date(header.NgayYeuCau), 'dd/MM/yyyy HH:mm') : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {header.TrangThai === 0 && (
            <Button onClick={() => handleAction('submit', 'Trình duyệt')} isLoading={actionLoading}>
              <Send size={16} /> Trình duyệt
            </Button>
          )}

          {header.TrangThai === 1 && (
            <>
              <Button variant="danger" onClick={() => handleAction('reject', 'Từ chối')} isLoading={actionLoading}>
                <XCircle size={16} /> Từ chối
              </Button>
              <Button variant="success" onClick={() => handleAction('approve', 'Phê duyệt')} isLoading={actionLoading}>
                <CheckCircle size={16} /> Phê duyệt
              </Button>
            </>
          )}

          {header.TrangThai === 2 && (
            <Button variant="primary" onClick={() => handleAction('createLenh', 'Tạo lệnh xuất ERP')} isLoading={actionLoading}>
              <Box size={16} /> Tạo Lệnh ERP
            </Button>
          )}

          {header.TrangThai >= 3 && header.TrangThai <= 6 && (
            <>
              <Button variant="secondary" onClick={() => handleAction('syncXuat', 'Đồng bộ Phiếu xuất')} isLoading={actionLoading}>
                <RefreshCw size={16} /> Sync Phiếu Xuất
              </Button>
              <Button variant="secondary" onClick={() => handleAction('syncNhap', 'Đồng bộ Phiếu nhập')} isLoading={actionLoading}>
                <RefreshCw size={16} /> Sync Phiếu Nhập
              </Button>
            </>
          )}

          {(header.TrangThai === 0 || header.TrangThai === 1) && (
            <Button variant="outline" className="text-danger hover:bg-[var(--danger-bg)] border-danger" onClick={() => handleAction('cancel', 'Huỷ')} isLoading={actionLoading}>
              Huỷ YC
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
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
                      <td className="font-medium text-[var(--primary)]">{vt.So_LenhSanXuat || '-'}</td>
                      <td className="font-semibold">{vt.Ma_VatTu}</td>
                      <td className="text-right">{vt.SoLuong_DeNghi_Xuat}</td>
                      <td className="text-right text-[var(--primary)] font-medium">{vt.SoLuong_DaXuat}</td>
                      <td className="text-right text-[var(--success)] font-medium">{vt.SoLuong_DaNhap}</td>
                      <td className="text-right text-[var(--danger)]">{vt.SoLuong_HaoHut}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <div className="flex gap-3">
              <div className="mt-0.5 text-muted"><Box size={18} /></div>
              <div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">Công đoạn lẻ</div>
                <div className="font-semibold text-[var(--text-main)] mt-0.5">{header.Ten_CongDoanLe}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 text-muted"><User size={18} /></div>
              <div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">Người tạo</div>
                <div className="font-semibold text-[var(--text-main)] mt-0.5">{header.TaiKhoan_Lap}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
