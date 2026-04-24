import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Clock, Activity, AlertCircle, TrendingUp, BarChart2, Package, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import reportApi from '../api/reportApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

function StatCard({ title, value, loading, icon: Icon, colorClass, bgAlphaClass, trend }) {
  return (
    <motion.div variants={itemVariants} className="flex-1">
      <Card className="h-full relative overflow-hidden group">
        <CardBody className="pt-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted text-sm font-medium uppercase tracking-wider">{title}</div>
              <div className={`text-4xl font-bold mt-2 ${colorClass || 'text-[var(--text-main)]'}`}>
                {loading ? <Skeleton className="h-10 w-20" /> : value}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${bgAlphaClass || 'bg-[var(--primary-light)] text-[var(--primary)]'}`}>
              <Icon size={24} />
            </div>
          </div>
          {trend && !loading && (
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-success">
              <TrendingUp size={16} />
              <span>{trend}</span>
              <span className="text-muted font-normal ml-1">so với tuần trước</span>
            </div>
          )}
          {loading && (
            <div className="mt-4">
              <Skeleton className="h-5 w-32" />
            </div>
          )}
        </CardBody>
        {/* Decorative background icon */}
        <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${colorClass || 'text-[var(--primary)]'}`}>
          <Icon size={120} />
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await reportApi.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Fetch dashboard failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Tổng yêu cầu"
          value={data?.TongYeuCau || 0}
          loading={loading}
          icon={FileText}
          trend="+12%"
          colorClass="text-[var(--primary)]"
          bgAlphaClass="bg-[var(--primary-light)] text-[var(--primary)]"
        />
        <StatCard
          title="Đang chờ duyệt"
          value={data?.DangChoDuyet || 0}
          loading={loading}
          icon={Clock}
          colorClass="text-[var(--warning)]"
          bgAlphaClass="bg-[var(--warning-bg)] text-[var(--warning)]"
        />
        <StatCard
          title="Đang xử lý"
          value={data?.DangXuLy || 0}
          loading={loading}
          icon={Activity}
          trend="+5%"
          colorClass="text-[var(--info)]"
          bgAlphaClass="bg-[var(--info-bg)] text-[var(--info)]"
        />
        <StatCard
          title="Quá hạn"
          value={data?.QuaHan || 0}
          loading={loading}
          icon={AlertCircle}
          colorClass="text-[var(--danger)]"
          bgAlphaClass="bg-[var(--danger-bg)] text-[var(--danger)]"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2 border-none">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-primary" size={20} />
                <CardTitle>Thống kê Yêu cầu theo tuần</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="h-72 flex items-end gap-4 justify-between pt-8">
              {/* Dummy Chart Visualization */}
              {[40, 70, 45, 90, 65, 85, 120].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className="w-full max-w-[48px] bg-[var(--primary-light)] group-hover:bg-[var(--primary)] rounded-t-md transition-colors relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--text-main)] text-white text-xs py-1 px-2 rounded font-medium">
                      {height * 2}
                    </div>
                  </motion.div>
                  <div className="text-xs text-muted font-medium">T{i + 2}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-4 border-b border-[var(--border-light)]">
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardBody className="pt-4">
              <div className="flex flex-col gap-6">
                {[
                  { title: 'Tạo mới yêu cầu #YC1002', time: '10 phút trước', icon: Package, color: 'text-primary', bg: 'bg-primary-light' },
                  { title: 'Phê duyệt yêu cầu #YC0998', time: '1 giờ trước', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg' },
                  { title: 'Hủy yêu cầu #YC0995', time: '3 giờ trước', icon: AlertCircle, color: 'text-danger', bg: 'bg-danger-bg' },
                  { title: 'Tạo lệnh xuất cho #YC0980', time: 'Hôm qua', icon: Activity, color: 'text-info', bg: 'bg-info-bg' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                      <act.icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-main)]">{act.title}</div>
                      <div className="text-xs text-muted mt-1">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
