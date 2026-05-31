import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { applicationApi } from '../api/application'
import AppLayout from '../components/layout/AppLayout'
import {
  Bell, ArrowRight, TrendingUp, Clock,
  CheckCircle, XCircle, Plus, FileText,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; hex: string }> = {
  Submitted:        { label: 'Submitted',    bg: 'bg-blue-100',   text: 'text-blue-700',   hex: '#3b82f6' },
  UnderReview:      { label: 'Under Review', bg: 'bg-yellow-100', text: 'text-yellow-700', hex: '#eab308' },
  DocumentsPending: { label: 'Docs Pending', bg: 'bg-orange-100', text: 'text-orange-700', hex: '#f97316' },
  Approved:         { label: 'Approved',     bg: 'bg-green-100',  text: 'text-green-700',  hex: '#22c55e' },
  Rejected:         { label: 'Rejected',     bg: 'bg-red-100',    text: 'text-red-700',    hex: '#ef4444' },
}
function getStatusCfg(s: string) {
  return STATUS_CONFIG[s] ?? { label: s, bg: 'bg-gray-100', text: 'text-gray-700', hex: '#9ca3af' }
}

const LOAN_ICONS: Record<string, string> = {
  Personal: '👤', Home: '🏠', Car: '🚗', Business: '💼', Education: '🎓',
}

// ── Custom Donut label ────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} application{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Build monthly bar data from apps ─────────────────────────────────────────
function buildMonthlyData(apps: any[]) {
  const months: Record<string, { month: string; Submitted: number; Approved: number; Rejected: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
    months[key] = { month: key, Submitted: 0, Approved: 0, Rejected: 0 }
  }
  apps.forEach((app) => {
    const d = new Date(app.createdAt)
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
    if (months[key]) {
      months[key].Submitted++
      if (app.status === 'Approved') months[key].Approved++
      if (app.status === 'Rejected') months[key].Rejected++
    }
  })
  return Object.values(months)
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll(),
  })

  const apps = data?.data ?? []
  const total       = apps.length
  const inProgress  = apps.filter((a) => a.status === 'Submitted').length
  const underReview = apps.filter((a) => a.status === 'UnderReview').length
  const approved    = apps.filter((a) => a.status === 'Approved').length
  const rejected    = apps.filter((a) => a.status === 'Rejected').length

  const stats = [
    { label: 'Total',        value: total,       color: 'text-blue-600',   bg: 'bg-blue-50',   icon: TrendingUp,  iconColor: 'text-blue-500' },
    { label: 'In Progress',  value: inProgress,  color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock,       iconColor: 'text-indigo-500' },
    { label: 'Under Review', value: underReview, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock,       iconColor: 'text-yellow-500' },
    { label: 'Approved',     value: approved,    color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle, iconColor: 'text-green-500' },
    { label: 'Rejected',     value: rejected,    color: 'text-red-600',    bg: 'bg-red-50',    icon: XCircle,     iconColor: 'text-red-500' },
  ]

  const pieData = [
    { name: 'In Progress',  value: inProgress,  color: '#3b82f6' },
    { name: 'Under Review', value: underReview, color: '#eab308' },
    { name: 'Approved',     value: approved,    color: '#22c55e' },
    { name: 'Rejected',     value: rejected,    color: '#ef4444' },
  ].filter((d) => d.value > 0)

  const barData = buildMonthlyData(apps)
  const recentApps = [...apps]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-gray-700">{user?.fullName}</span>!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 bg-white text-gray-500 hover:text-blue-600 rounded-xl border border-gray-200 shadow-sm transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}
              onClick={() => navigate('/profile')}
            >
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map(({ label, value, color, bg, icon: Icon, iconColor }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div className={`text-2xl font-bold ${color}`}>
                {isLoading ? '—' : String(value).padStart(2, '0')}
              </div>
              <div className="text-gray-500 text-xs mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Donut — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Status Breakdown</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {total} total
              </span>
            </div>

            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : total === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 rounded-full border-8 border-gray-100 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-gray-300">0</span>
                </div>
                <p className="text-sm">No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={CustomLabel}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(({ name, value: v, color }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-gray-600 font-medium">{name}</span>
                      </div>
                      <span className="text-gray-400">{v} ({total ? Math.round((v / total) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bar Chart — 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Application Trend</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                Last 6 months
              </span>
            </div>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={10} barGap={4}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: '#f9fafb', radius: 4 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submitted" />
                  <Bar dataKey="Approved"  fill="#22c55e" radius={[4, 4, 0, 0]} name="Approved" />
                  <Bar dataKey="Rejected"  fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Recent Applications ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Applications</h2>
            <button
              onClick={() => navigate('/applications')}
              className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No applications yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentApps.map((app) => {
                const cfg = getStatusCfg(app.status)
                return (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {LOAN_ICONS[app.loanType] ?? '📄'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">{app.loanType} Loan</div>
                      <div className="text-xs text-gray-400 truncate">{app.applicationNumber}</div>
                      <div className="text-xs text-gray-400">
                        ₹{app.requestedAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Apply CTA ── */}
        <button
          onClick={() => navigate('/apply')}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:opacity-95 text-sm"
          style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
        >
          <Plus size={18} />
          Apply for New Loan
        </button>

      </div>
    </AppLayout>
  )
}
