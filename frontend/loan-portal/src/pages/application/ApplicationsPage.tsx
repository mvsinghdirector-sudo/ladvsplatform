import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, PlusCircle, FileText, ChevronRight, SlidersHorizontal } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { applicationApi } from '../../api/application'
import type { ApplicationResponse } from '../../types'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Submitted:        { label: 'Submitted',    color: 'bg-blue-100 text-blue-700' },
  UnderReview:      { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  DocumentsPending: { label: 'Docs Pending', color: 'bg-orange-100 text-orange-700' },
  Approved:         { label: 'Approved',     color: 'bg-green-100 text-green-700' },
  Rejected:         { label: 'Rejected',     color: 'bg-red-100 text-red-700' },
}

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' }
}

const LOAN_TYPE_ICONS: Record<string, string> = {
  Personal:  '👤',
  Home:      '🏠',
  Car:       '🚗',
  Business:  '💼',
  Education: '🎓',
}

const ALL_STATUSES = ['All', 'Submitted', 'UnderReview', 'DocumentsPending', 'Approved', 'Rejected']

// ── Application card ─────────────────────────────────────────────────────────
function AppCard({ app, onClick }: { app: ApplicationResponse; onClick: () => void }) {
  const cfg = getStatusCfg(app.status)
  const icon = LOAN_TYPE_ICONS[app.loanType] ?? '📄'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{app.loanType} Loan</div>
            <div className="text-xs text-gray-400 mt-0.5">{app.applicationNumber}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(app.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>
          <div className="text-sm font-bold text-gray-900">
            ₹{app.requestedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400">{app.tenureMonths} months</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{app.applicantName}</span>
        <ChevronRight
          size={15}
          className="text-gray-300 group-hover:text-blue-500 transition-colors"
        />
      </div>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const navigate = useNavigate()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll(),
  })

  const apps = data?.data ?? []

  // Filter
  const filtered = apps.filter((app) => {
    const matchStatus = statusFilter === 'All' || app.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      app.applicationNumber.toLowerCase().includes(q) ||
      app.loanType.toLowerCase().includes(q) ||
      app.applicantName.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading ? 'Loading…' : `${apps.length} application${apps.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button
            onClick={() => navigate('/apply')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <PlusCircle size={16} />
            New Application
          </button>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by application number, loan type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || statusFilter !== 'All'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filter
            {statusFilter !== 'All' && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* ── Status filter pills ── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {ALL_STATUSES.map((s) => {
              const cfg = s === 'All' ? null : getStatusCfg(s)
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? s === 'All'
                        ? 'bg-gray-800 text-white'
                        : cfg!.color + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s === 'All' ? 'All Statuses' : cfg!.label}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 text-lg">
              {search || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {search || statusFilter !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Start your loan journey by applying now'}
            </p>
            {!search && statusFilter === 'All' && (
              <button
                onClick={() => navigate('/apply')}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Apply for a Loan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onClick={() => navigate(`/applications/${app.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
