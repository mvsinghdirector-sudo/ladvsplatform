import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { applicationApi } from '../../api/application'
import { documentApi } from '../../api/document'
import { useAuth } from '../../lib/AuthContext'
import type { DocumentUploadResponse } from '../../types'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  Submitted:        { label: 'Submitted',       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: Clock },
  UnderReview:      { label: 'Under Review',    color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  DocumentsPending: { label: 'Docs Pending',    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: AlertCircle },
  Approved:         { label: 'Approved',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  Rejected:         { label: 'Rejected',        color: 'text-red-600',    bg: 'bg-red-50 border-red-200',      icon: XCircle },
}

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? {
    label: status, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Clock,
  }
}

// ── Timeline steps ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'Submitted',        label: 'Application Submitted', desc: 'Your application has been received' },
  { key: 'UnderReview',      label: 'Under Review',          desc: 'Our team is reviewing your application' },
  { key: 'DocumentsPending', label: 'Documents Pending',     desc: 'Please upload the required documents' },
  { key: 'Approved',         label: 'Approved',              desc: 'Congratulations! Your loan is approved' },
]

const STATUS_ORDER = ['Submitted', 'UnderReview', 'DocumentsPending', 'Approved']

function getStepState(stepKey: string, currentStatus: string): 'done' | 'active' | 'pending' {
  if (currentStatus === 'Rejected') {
    const idx = STATUS_ORDER.indexOf(stepKey)
    const cur = STATUS_ORDER.indexOf('UnderReview')
    if (idx < cur) return 'done'
    if (idx === cur) return 'active'
    return 'pending'
  }
  const stepIdx = STATUS_ORDER.indexOf(stepKey)
  const curIdx  = STATUS_ORDER.indexOf(currentStatus)
  if (stepIdx < curIdx)  return 'done'
  if (stepIdx === curIdx) return 'active'
  return 'pending'
}

// ── Required document types ──────────────────────────────────────────────────
const REQUIRED_DOCS = [
  { type: 'Aadhaar',          label: 'Aadhaar Card' },
  { type: 'PAN',              label: 'PAN Card' },
  { type: 'SalarySlip',       label: 'Salary Slip / ITR' },
  { type: 'BankStatement',    label: 'Bank Statement' },
]

// ── Document uploader row ────────────────────────────────────────────────────
interface UploaderRowProps {
  applicationId: string
  applicantId:   string
  docType:       string
  label:         string
  existing:      DocumentUploadResponse | undefined
  onSuccess:     (doc: DocumentUploadResponse) => void
}

function UploaderRow({ applicationId, applicantId, docType, label, existing, onSuccess }: UploaderRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    // Client-side validation
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      setError('Only PDF, JPG, PNG allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB')
      return
    }

    try {
      setUploading(true)
      const res = await documentApi.upload(applicationId, applicantId, docType, file)
      if (res.success) {
        toast.success(`${label} uploaded`)
        onSuccess(res.data)
      } else {
        setError(res.error ?? 'Upload failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const docStatusCfg: Record<string, { color: string; label: string }> = {
    Uploaded: { color: 'text-blue-600 bg-blue-50',   label: 'Uploaded' },
    Verified: { color: 'text-green-600 bg-green-50', label: 'Verified' },
    Rejected: { color: 'text-red-600 bg-red-50',     label: 'Rejected' },
  }
  const dsCfg = existing ? (docStatusCfg[existing.status] ?? { color: 'text-gray-600 bg-gray-50', label: existing.status }) : null

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-blue-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {existing ? (
            <div className="text-xs text-gray-400 truncate mt-0.5">{existing.fileName}</div>
          ) : (
            <div className="text-xs text-gray-400">PDF, JPG, PNG · Max 5 MB</div>
          )}
          {error && <div className="text-xs text-red-500 mt-0.5">{error}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {existing && dsCfg && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dsCfg.color}`}>
            {dsCfg.label}
          </span>
        )}
        {existing?.sasUrl && (
          <a
            href={existing.sasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={15} />
          </a>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={13} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload size={13} /> {existing ? 'Replace' : 'Upload'}</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const appId = Number(id)

  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationApi.getById(appId),
    enabled: !!appId,
  })

  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', String(appId)],
    queryFn: () => documentApi.getByApplicationId(String(appId)),
    enabled: !!appId,
  })

  const app  = appData?.data
  const docs = docsData?.data ?? []

  const getDoc = (type: string) => docs.find((d) => d.documentType === type)

  const handleUploadSuccess = () => {
    refetchDocs()
    queryClient.invalidateQueries({ queryKey: ['application', appId] })
  }

  if (appLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    )
  }

  if (!app) {
    return (
      <AppLayout>
        <div className="p-6 max-w-3xl mx-auto text-center py-20">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Application not found</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    )
  }

  const statusCfg = getStatusCfg(app.status)
  const StatusIcon = statusCfg.icon

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">

        {/* ── Back + Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {app.applicationNumber}
            </h1>
            <p className="text-gray-500 text-sm">
              {app.loanType} Loan · Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
            <StatusIcon size={14} />
            {statusCfg.label}
          </span>
        </div>

        {/* ── Loan Summary Card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Loan Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Loan Type</div>
              <div className="font-semibold text-gray-900">{app.loanType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Amount</div>
              <div className="font-semibold text-gray-900">
                ₹{app.requestedAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Tenure</div>
              <div className="font-semibold text-gray-900">{app.tenureMonths} months</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Applicant</div>
              <div className="font-semibold text-gray-900 truncate">{app.applicantName}</div>
            </div>
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-5">Application Status</h2>

          {app.status === 'Rejected' && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <XCircle size={16} className="flex-shrink-0" />
              Your application has been rejected. Please contact support for more details.
            </div>
          )}

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {TIMELINE_STEPS.map(({ key, label, desc }) => {
                const state = getStepState(key, app.status)
                return (
                  <div key={key} className="flex items-start gap-4 relative">
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                        state === 'done'
                          ? 'bg-green-500 border-green-500'
                          : state === 'active'
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {state === 'done' ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : state === 'active' ? (
                        <Clock size={14} className="text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-1 min-w-0">
                      <div className={`text-sm font-semibold ${
                        state === 'done' ? 'text-green-700'
                        : state === 'active' ? 'text-blue-700'
                        : 'text-gray-400'
                      }`}>
                        {label}
                      </div>
                      <div className={`text-xs mt-0.5 ${state === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Documents ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Documents</h2>
            {docsLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
          </div>

          <div className="space-y-3">
            {REQUIRED_DOCS.map(({ type, label }) => (
              <UploaderRow
                key={type}
                applicationId={String(app.id)}
                applicantId={user?.applicantId ?? ''}
                docType={type}
                label={label}
                existing={getDoc(type)}
                onSuccess={handleUploadSuccess}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Accepted formats: PDF, JPG, PNG · Maximum file size: 5 MB per document
          </p>
        </div>

      </div>
    </AppLayout>
  )
}
