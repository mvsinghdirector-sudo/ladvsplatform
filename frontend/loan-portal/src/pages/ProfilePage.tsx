import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User, Mail, Hash, FileText, LogOut } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { applicationApi } from '../api/application'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll(),
  })

  const apps = data?.data ?? []
  const approved  = apps.filter((a) => a.status === 'Approved').length
  const pending   = apps.filter((a) => ['Submitted', 'UnderReview', 'DocumentsPending'].includes(a.status)).length
  const rejected  = apps.filter((a) => a.status === 'Rejected').length

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your account information</p>
        </div>

        {/* Avatar + Name */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1.5 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
              Applicant
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total',    value: apps.length, color: 'text-blue-600' },
            { label: 'Approved', value: approved,    color: 'text-green-600' },
            { label: 'Pending',  value: pending,     color: 'text-yellow-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value.toString().padStart(2, '0')}</div>
              <div className="text-xs text-gray-500 mt-1">{label} Applications</div>
            </div>
          ))}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-4">
            {[
              { icon: User,     label: 'Full Name',     value: user?.fullName },
              { icon: Mail,     label: 'Email Address', value: user?.email },
              { icon: Hash,     label: 'Applicant ID',  value: user?.applicantId },
              { icon: FileText, label: 'Applications',  value: `${apps.length} total · ${approved} approved · ${rejected} rejected` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm font-medium text-gray-900 mt-0.5 break-all">{value ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-3 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </AppLayout>
  )
}
