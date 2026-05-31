import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, Clock, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { applicationApi } from '../api/application'
import type { ApplicationResponse } from '../types'

// Derive notifications from application status changes
function buildNotifications(apps: ApplicationResponse[]) {
  return apps
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((app) => {
      const base = {
        id:    app.id,
        appId: app.id,
        appNo: app.applicationNumber,
        date:  app.createdAt,
      }
      switch (app.status) {
        case 'Approved':
          return { ...base, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50',
            title: 'Application Approved!',
            desc:  `Your ${app.loanType} loan application ${app.applicationNumber} has been approved.` }
        case 'Rejected':
          return { ...base, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50',
            title: 'Application Rejected',
            desc:  `Your ${app.loanType} loan application ${app.applicationNumber} was not approved.` }
        case 'UnderReview':
          return { ...base, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50',
            title: 'Application Under Review',
            desc:  `${app.applicationNumber} is currently being reviewed by our team.` }
        case 'DocumentsPending':
          return { ...base, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50',
            title: 'Documents Required',
            desc:  `Please upload the required documents for ${app.applicationNumber}.` }
        default:
          return { ...base, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50',
            title: 'Application Submitted',
            desc:  `Your ${app.loanType} loan application ${app.applicationNumber} has been received.` }
      }
    })
}

export default function NotificationsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll(),
  })

  const apps = data?.data ?? []
  const notifications = buildNotifications(apps)

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
          {notifications.length > 0 && (
            <span className="text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-full">
              {notifications.length} new
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No notifications yet</h3>
            <p className="text-gray-400 text-sm mt-1">
              You'll see updates about your applications here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = n.icon
              return (
                <div
                  key={n.id}
                  onClick={() => navigate(`/applications/${n.appId}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className={`w-10 h-10 ${n.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={n.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{n.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.desc}</div>
                    <div className="text-gray-400 text-xs mt-1.5">
                      {new Date(n.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
