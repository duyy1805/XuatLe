import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Plus, Eye, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import yeuCauApi from '../api/yeuCauApi';
import { format } from 'date-fns';

const STATUS_MAP = {
  0: { label: 'Nháp', variant: 'neutral' },
  1: { label: 'Đang chờ duyệt', variant: 'warning' },
  2: { label: 'Chờ tạo lệnh ERP', variant: 'info' },
  3: { label: 'Đang thực hiện', variant: 'primary' },
  4: { label: 'Đang thực hiện', variant: 'primary' },
  5: { label: 'Đang thực hiện', variant: 'primary' },
  6: { label: 'Đang thực hiện', variant: 'primary' },
  7: { label: 'Hoàn thành', variant: 'success' },
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

export default function YeuCauList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchList() {
      try {
        const res = await yeuCauApi.getList({});
        if (res.success) {
          setList(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách yêu cầu');
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu xuất lẻ</CardTitle>
            <Button onClick={() => navigate('/yeu-cau/tao-moi')}>
              <Plus size={16} /> Tạo mới
            </Button>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th>Mã YC</th>
                    <th>Ngày yêu cầu</th>
                    <th>Công đoạn lẻ</th>
                    <th>Người tạo</th>
                    <th>Tiến độ (Xuất/Nhập)</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton columns={7} rows={5} />
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                          <Inbox size={48} className="mb-4 opacity-20" />
                          <p>Không có dữ liệu yêu cầu nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    list.map((item, index) => (
                      <motion.tr
                        key={item.ID_XuatLe_YeuCau}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26, delay: index * 0.035 }}
                      >
                        <td className="font-semibold text-blue-600">#{item.ID_XuatLe_YeuCau}</td>
                        <td>{item.Ngay_YeuCau ? format(new Date(item.Ngay_YeuCau), 'dd/MM/yyyy') : ''}</td>
                        <td className="font-medium">{item.Ten_CongDoanLe}</td>
                        <td>{item.TaiKhoan_Lap}</td>
                        <td>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1 min-w-[100px]">
                              <div className="flex justify-between text-[10px] font-medium uppercase text-slate-500">
                                <span>Xuất: {item.SoLuong_DaXuat || 0}</span>
                                <span>Nhập: {item.SoLuong_DaNhap || 0}</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${Math.min(((item.SoLuong_DaXuat || 0) / (item.SoLuong_DeNghi || 1)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge variant={STATUS_MAP[item.TrangThai]?.variant || 'neutral'}>
                            {STATUS_MAP[item.TrangThai]?.label || `Trạng thái ${item.TrangThai}`}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/yeu-cau/${item.ID_XuatLe_YeuCau}`)}>
                            <Eye size={14} /> Chi tiết
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
