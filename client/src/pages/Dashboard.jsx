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
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</div>
              <div className={`mt-2 text-4xl font-bold ${colorClass || 'text-slate-900 dark:text-white'}`}>
                {loading ? <Skeleton className="h-10 w-20" /> : value}
              </div>
            </div>
            <div className={`rounded-2xl p-3 ${bgAlphaClass || 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
              <Icon size={24} />
            </div>
          </div>
          {trend && !loading && (
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp size={16} />
              <span>{trend}</span>
              <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">so với tuần trước</span>
            </div>
          )}
          {loading && (
            <div className="mt-4">
              <Skeleton className="h-5 w-32" />
            </div>
          )}
        </CardBody>
        {/* Decorative background icon */}
        <div className={`absolute -right-6 -bottom-6 opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${colorClass || 'text-blue-600'}`}>
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
          colorClass="text-blue-600 dark:text-blue-400"
          bgAlphaClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Đang chờ duyệt"
          value={data?.DangChoDuyet || 0}
          loading={loading}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          bgAlphaClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard
          title="Đang xử lý"
          value={data?.DangXuLy || 0}
          loading={loading}
          icon={Activity}
          trend="+5%"
          colorClass="text-sky-600 dark:text-sky-400"
          bgAlphaClass="bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
        />
        <StatCard
          title="Quá hạn"
          value={data?.QuaHan || 0}
          loading={loading}
          icon={AlertCircle}
          colorClass="text-red-600 dark:text-red-400"
          bgAlphaClass="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2 border-none">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-blue-600" size={20} />
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
                    className="relative w-full max-w-[48px] rounded-t-md bg-blue-50 transition-colors group-hover:bg-blue-600 dark:bg-blue-900/20 dark:group-hover:bg-blue-500"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-800">
                      {height * 2}
                    </div>
                  </motion.div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">T{i + 2}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-white/10">
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardBody className="pt-4">
              <div className="flex flex-col gap-6">
                {[
                  { title: 'Tạo mới yêu cầu #YC1002', time: '10 phút trước', icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  { title: 'Phê duyệt yêu cầu #YC0998', time: '1 giờ trước', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { title: 'Hủy yêu cầu #YC0995', time: '3 giờ trước', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                  { title: 'Tạo lệnh xuất cho #YC0980', time: 'Hôm qua', icon: Activity, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                      <act.icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{act.title}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{act.time}</div>
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
