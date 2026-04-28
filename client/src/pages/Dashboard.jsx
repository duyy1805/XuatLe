import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Clock, Activity, AlertCircle, TrendingUp, BarChart2, Package, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import reportApi from '../api/reportApi';
import { format } from 'date-fns';

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
          value={data?.summary?.TongYeuCau || 0}
          loading={loading}
          icon={FileText}
          colorClass="text-blue-600 dark:text-blue-400"
          bgAlphaClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Đang chờ duyệt"
          value={data?.summary?.DangChoDuyet || 0}
          loading={loading}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          bgAlphaClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard
          title="Đang xử lý"
          value={data?.summary?.DangXuLy || 0}
          loading={loading}
          icon={Activity}
          colorClass="text-sky-600 dark:text-sky-400"
          bgAlphaClass="bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
        />
        <StatCard
          title="Quá hạn"
          value={data?.summary?.QuaHan || 0}
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
                <CardTitle>Yêu cầu mới (7 ngày qua)</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="h-72 flex items-end gap-4 justify-between pt-8">
              {loading ? (
                <div className="w-full flex justify-center py-12"><Activity className="animate-spin text-blue-500" /></div>
              ) : (data?.chart || []).map((day, i) => {
                const maxVal = Math.max(...(data?.chart || []).map(d => d.Value), 1);
                const heightPercent = (day.Value / maxVal) * 100;
                return (
                  <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercent, 5)}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className="relative w-full max-w-[48px] rounded-t-md bg-blue-100 transition-colors group-hover:bg-blue-600 dark:bg-blue-900/40 dark:group-hover:bg-blue-500"
                    >
                      {day.Value > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-800">
                          {day.Value}
                        </div>
                      )}
                    </motion.div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{day.Label}</div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-white/10">
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardBody className="pt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-6">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (data?.activities || []).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Chưa có hoạt động nào</div>
                ) : (data?.activities || []).map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5`}>
                      <Activity size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                        {act.NoiDung} {act.So_YeuCau && <span className="text-blue-600 dark:text-blue-400">#{act.So_YeuCau}</span>}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col">
                        <span>{act.NguoiThucHien}</span>
                        <span>{act.ThoiGian_ThucHien ? format(new Date(act.ThoiGian_ThucHien), 'HH:mm dd/MM/yyyy') : ''}</span>
                      </div>
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
