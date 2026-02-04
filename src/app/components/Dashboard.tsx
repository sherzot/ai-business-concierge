import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { getDashboardStats } from '../api';

type Tenant = {
  id: string;
  name: string;
};

interface DashboardProps {
  tenant: Tenant;
}

type DashboardStats = {
  healthScore: number;
  monthlyRevenue: number;
  tasksOverdue: number;
  pendingApprovals: number;
  chartData: { day: string; score: number }[];
};

export function Dashboard({ tenant }: DashboardProps) {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    loadStats();
  }, [tenant.id]);

  async function loadStats() {
    try {
      const data = await getDashboardStats(tenant.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assalomu alaykum, Jasurbek 👋</h1>
          <p className="text-slate-500">Bugungi biznes holatingiz qisqacha.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Hisobotni yuklash
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            AI Audit (Run)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Business Health" 
          value={`${stats?.healthScore ?? 0}/100`} 
          trend="+4.2%" 
          trendUp={true}
          icon={<HeartBeatIcon />} 
          color="indigo"
        />
        <StatCard 
          title="Oylik Tushum (Forecast)" 
          value={`$${stats?.monthlyRevenue?.toLocaleString() ?? 0}`} 
          trend="+12%" 
          trendUp={true}
          icon={<TrendingUp size={20} className="text-emerald-600" />} 
          color="emerald"
        />
        <StatCard 
          title="Tasks Overdue" 
          value={`${stats?.tasksOverdue ?? 0}`} 
          trend="-2" 
          trendUp={false} // Good that it's down, but logic handled below
          inverseTrend // trendUp=false usually means bad, but here less is better
          icon={<Clock size={20} className="text-amber-600" />} 
          color="amber"
        />
        <StatCard 
          title="Pending Approvals" 
          value={`${stats?.pendingApprovals ?? 0}`} 
          trend="0" 
          trendUp={true}
          icon={<CheckCircle2 size={20} className="text-blue-600" />} 
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Business Health Trend</h3>
            <select className="text-sm border-slate-200 rounded-md text-slate-500">
              <option>Oxirgi 7 kun</option>
              <option>Oxirgi 30 kun</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData ?? []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  domain={[60, 100]}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights / Bottlenecks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Diqqat Talab (AI Insights)
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            <InsightItem 
              type="danger" 
              title="Kassadagi yetishmovchilik xavfi" 
              desc="Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin."
            />
            <InsightItem 
              type="warning" 
              title="HR: 3 ta xodimda 'Burnout'" 
              desc="Oxirgi so'rovnomalarda Marketing bo'limida stress darajasi oshgan."
            />
            <InsightItem 
              type="info" 
              title="Shartnoma muddati tugamoqda" 
              desc="'Global Tech' bilan shartnoma 5 kundan keyin tugaydi. Avto-yangilash o'chiq."
            />
          </div>
          <button className="mt-4 w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
            Barcha hisobotlarni ko'rish <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Components
function StatCard({ title, value, trend, trendUp, inverseTrend, icon, color }: any) {
  const isPositive = inverseTrend ? !trendUp : trendUp;
  
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {trend}
        </span>
        <span className="text-slate-400 ml-2">o'tgan oyga nisbatan</span>
      </div>
    </div>
  );
}

function InsightItem({ type, title, desc }: { type: 'danger' | 'warning' | 'info', title: string, desc: string }) {
  const styles = {
    danger: "bg-rose-50 border-rose-100 text-rose-900",
    warning: "bg-amber-50 border-amber-100 text-amber-900",
    info: "bg-blue-50 border-blue-100 text-blue-900",
  };

  const icons = {
    danger: <AlertTriangle size={16} className="text-rose-600 shrink-0" />,
    warning: <Clock size={16} className="text-amber-600 shrink-0" />,
    info: <CheckCircle2 size={16} className="text-blue-600 shrink-0" />,
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[type]} flex items-start gap-3`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs mt-1 opacity-90 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function HeartBeatIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-indigo-600"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
