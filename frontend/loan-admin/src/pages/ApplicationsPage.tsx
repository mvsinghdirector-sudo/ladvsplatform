import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { appClient } from '../api/client'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await appClient.get('/api/v1/Applications')
      return res.data.data
    },
    refetchInterval: 30000
  })

  const filtered = data?.filter((app: any) => {
    const matchSearch = app.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || app.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage loan applications</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by application number or name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="All">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="UnderReview">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No applications found</td></tr>
            ) : (
              filtered?.map((app: any, index: number) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.applicationNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.applicantName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.loanType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{app.requestedAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'UnderReview' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{app.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="text-blue-600 text-sm hover:underline font-medium">
                      Review →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}