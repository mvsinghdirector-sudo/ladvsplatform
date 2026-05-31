import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { appClient, adminClient } from '../api/client'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [remarks, setRemarks] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const { data: appData, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const res = await appClient.get(`/api/v1/Applications/${id}`)
      return res.data.data
    }
  })

  const actionMutation = useMutation({
    mutationFn: async (action: 'Approve' | 'Reject') => {
      const res = await adminClient.post('/api/v1/Admin/action', {
        adminId: 'ADMIN-001',
        adminEmail: 'mvsingh.director@gmail.com',
        adminRole: 'LoanAdmin',
        applicationId: appData?.applicationNumber,
        applicantId: appData?.applicantName,
        actionType: action,
        previousStatus: appData?.status,
        newStatus: action === 'Approve' ? 'Approved' : 'Rejected',
        remarks: remarks,
        rejectionReason: action === 'Reject' ? rejectionReason : ''
      })
      return res.data
    },
    onSuccess: (_, action) => {
      toast.success(`Application ${action}d successfully!`)
      navigate('/applications')
    },
    onError: () => toast.error('Action failed — please try again')
  })

  if (isLoading) return (
    <div className="p-6 text-center text-gray-500">Loading application...</div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Applications
      </button>

      {/* Application Header */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {appData?.applicationNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              {appData?.loanType} Loan • ₹{appData?.requestedAmount?.toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appData?.status === 'Approved' ? 'bg-green-100 text-green-700' :
            appData?.status === 'Rejected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {appData?.status}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Applicant Details</h2>
          <div className="space-y-3">
            <Detail label="Name" value={appData?.applicantName} />
            <Detail label="Email" value={appData?.applicantEmail} />
            <Detail label="Phone" value={appData?.applicantPhone} />
            <Detail label="Employment" value={appData?.employmentType} />
            <Detail label="Company" value={appData?.companyName} />
            <Detail label="Monthly Income" value={`₹${appData?.monthlyIncome?.toLocaleString()}`} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Loan Details</h2>
          <div className="space-y-3">
            <Detail label="Loan Type" value={appData?.loanType} />
            <Detail label="Requested Amount" value={`₹${appData?.requestedAmount?.toLocaleString()}`} />
            <Detail label="Tenure" value={`${appData?.tenureMonths} months`} />
            <Detail label="Applied On" value={new Date(appData?.createdAt).toLocaleDateString('en-IN')} />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Remarks</h2>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add remarks for this decision..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      {appData?.status === 'Submitted' && (
        <div className="flex gap-4">
          <button
            onClick={() => actionMutation.mutate('Approve')}
            disabled={actionMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            <CheckCircle className="w-5 h-5" />
            Approve Application
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={actionMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            <XCircle className="w-5 h-5" />
            Reject Application
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 mb-4">Reject Application</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  actionMutation.mutate('Reject')
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-medium">{value || '-'}</span>
    </div>
  )
}