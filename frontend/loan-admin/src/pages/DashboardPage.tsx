import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { adminClient, appClient } from '../api/client'
import { Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await adminClient.get('/api/v1/Admin/dashboard')
      return res.data.data
    },
    refetchInterval: 30000 // refresh every 30s
  })

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await appClient.get('/api/v1/Applications')
      return res.data.data
    }
  })

  const stats = [
    {
      label: 'Total Applications',
      value: applications?.length || 0,
      icon: FileText,
      color: 'bg-blue-500',
      light: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Pending Review',
      value: applications?.filter((a: any) => a.status === 'Submitted').length || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      light: 'bg-yellow-50 text-yellow-700'
    },
    {
      label: 'Approved Today',
      value: dashboard?.approvedToday || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      light: 'bg-green-50 text-green-700'
    },
    {
      label: 'Rejected Today',
      value: dashboard?.rejectedToday || 0,
      icon: XCircle,
      color: 'bg-red-500',
      light: 'bg-red-50 text-red-700'
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">LADVS Admin Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">{stat.label}</span>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <button
            onClick={() => navigate('/applications')}
            className="text-blue-600 text-sm hover:underline">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications?.slice(0, 5).map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {app.applicationNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {app.applicantName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ₹{app.requestedAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="text-blue-600 text-sm hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Submitted: 'bg-blue-100 text-blue-700',
    UnderReview: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}