import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableContainer } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Plus, Eye, Inbox, Search, RotateCcw } from 'lucide-react';
import { Input, Select } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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

export default function YeuCauList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    trangThai: '',
    tuNgay: '',
    denNgay: ''
  });
  const navigate = useNavigate();

  const fetchList = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      const params = {
        keyword: filters.keyword || null,
        trangThai: filters.trangThai !== '' ? Number(filters.trangThai) : null,
        tuNgay: filters.tuNgay || null,
        denNgay: filters.denNgay || null
      };
      const res = await yeuCauApi.getList(params);
      if (res.success) {
        setList(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      const res = await yeuCauApi.getList({});
      if (!ignore && res.success) {
        setList(res.data);
        setLoading(false);
      }
    }
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchList();
  };

  const handleReset = () => {
    const defaultFilters = {
      keyword: '',
      trangThai: '',
      tuNgay: '',
      denNgay: ''
    };
    setFilters(defaultFilters);
    setLoading(true);
    yeuCauApi.getList({}).then(res => {
      if (res.success) setList(res.data);
      setLoading(false);
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Danh sách yêu cầu xuất lẻ</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi tiến độ xuất nhập vật tư lẻ</p>
            </div>
            <Button onClick={() => navigate('/yeu-cau/tao-moi')}>
              <Plus size={16} /> Tạo mới
            </Button>
          </CardHeader>
          <CardBody className="flex flex-col gap-6">
            {/* Filter Section */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5">
              <Input
                label="Tìm kiếm"
                placeholder="Mã yêu cầu..."
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                className="bg-white dark:bg-slate-950"
              />
              <Select
                label="Trạng thái"
                name="trangThai"
                value={filters.trangThai}
                onChange={handleFilterChange}
                className="bg-white dark:bg-slate-950"
              >
                <option value="">Tất cả</option>
                <option value="0">Nháp</option>
                <option value="1">Đang chờ duyệt</option>
                <option value="2">Chờ tạo lệnh ERP</option>
                <option value="3">Đã tạo lệnh ERP</option>
                <option value="4">Đang xuất kho</option>
                <option value="5">Đã xuất đủ</option>
                <option value="6">Đang nhập lại</option>
                <option value="7">Hoàn thành</option>
                <option value="8">Quá hạn</option>
                <option value="9">Đã hủy</option>
              </Select>
              <Input
                type="date"
                label="Từ ngày"
                name="tuNgay"
                value={filters.tuNgay}
                onChange={handleFilterChange}
                className="bg-white dark:bg-slate-950"
                wrapperClass="gap-1"
              />
              <Input
                type="date"
                label="Đến ngày"
                name="denNgay"
                value={filters.denNgay}
                onChange={handleFilterChange}
                className="bg-white dark:bg-slate-950"
                wrapperClass="gap-1"
              />
              <div className="flex items-end gap-2 pb-0.5">
                <Button type="submit" className="flex-1 h-[42px]">
                  <Search size={16} /> Tìm
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} title="Đặt lại" className="h-[42px] px-3">
                  <RotateCcw size={16} />
                </Button>
              </div>
            </form>

            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th>Số YC</th>
                    <th>Ngày yêu cầu</th>
                    <th>Công đoạn lẻ</th>
                    {/* <th>Người tạo</th> */}
                    <th>Tiến độ (Xuất/Nhập)</th>
                    <th>Bộ phận</th>
                    <th>Hạn hoàn thành</th>
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
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
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
                        <td className="font-semibold text-blue-600">{item.So_YeuCau}</td>
                        <td>{item.Ngay_YeuCau ? format(new Date(item.Ngay_YeuCau), 'dd/MM/yyyy') : ''}</td>
                        <td className="font-medium">{item.Ten_CongDoanLe}</td>
                        {/* <td>{item.Ten_NguoiLap || item.TaiKhoan_Lap}</td> */}
                        <td>
                          <div className="flex flex-col gap-2.5 min-w-[120px] py-1">
                            {/* Tiến độ Xuất */}
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px] font-bold uppercase text-blue-600/80 dark:text-blue-400/80">
                                <span>Xuất: {item.SoLuong_DaXuat || 0}</span>
                                <span>{Math.round(((item.SoLuong_DaXuat || 0) / (item.SoLuong_DeNghi_Xuat || 1)) * 100)}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(((item.SoLuong_DaXuat || 0) / (item.SoLuong_DeNghi_Xuat || 1)) * 100, 100)}%` }}
                                  className="h-full bg-blue-500"
                                />
                              </div>
                            </div>

                            {/* Tiến độ Nhập */}
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px] font-bold uppercase text-emerald-600/80 dark:text-emerald-400/80">
                                <span>Nhập: {item.SoLuong_DaNhap || 0}</span>
                                <span>{Math.round(((item.SoLuong_DaNhap || 0) / (item.SoLuong_DeNghi_Xuat || 1)) * 100)}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(((item.SoLuong_DaNhap || 0) / (item.SoLuong_DeNghi_Xuat || 1)) * 100, 100)}%` }}
                                  className="h-full bg-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{item.Ten_BoPhan_Nhan}</td>
                        <td>{item.Deadline_HoanThanh ? format(new Date(item.Deadline_HoanThanh), 'dd/MM/yyyy') : ''}</td>
                        <td>
                          <Badge variant={STATUS_MAP[item.TrangThai]?.variant || 'neutral'}>
                            {STATUS_MAP[item.TrangThai]?.label || `Trạng thái ${item.TrangThai}`}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/yeu-cau/${item.ID_XuatLe_YeuCau}`)}>
                            <Eye size={14} />
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
