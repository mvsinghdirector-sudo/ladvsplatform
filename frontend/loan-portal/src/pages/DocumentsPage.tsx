import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { applicationApi } from '../api/application'
import { documentApi } from '../api/document'
import type { DocumentUploadResponse } from '../types'

const DOC_STATUS: Record<string, { color: string; label: string }> = {
  Uploaded: { color: 'bg-blue-100 text-blue-700',   label: 'Uploaded' },
  Verified: { color: 'bg-green-100 text-green-700', label: 'Verified' },
  Rejected: { color: 'bg-red-100 text-red-700',     label: 'Rejected' },
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll(),
  })

  const apps = appsData?.data ?? []

  // Fetch docs for all applications
  const { data: allDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['all-documents', apps.map((a) => a.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        apps.map((app) => documentApi.getByApplicationId(String(app.id)))
      )
      return results.flatMap((r) => r.data ?? [])
    },
    enabled: apps.length > 0,
  })

  const docs: DocumentUploadResponse[] = allDocs ?? []

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase()
    return (
      !q ||
      d.documentType.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q)
    )
  })

  const isLoading = appsLoading || docsLoading

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading ? 'Loading…' : `${docs.length} document${docs.length !== 1 ? 's' : ''} across all applications`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by document type or file name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">
              {search ? 'No matching documents' : 'No documents yet'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Try a different search term' : 'Upload documents from your application detail page'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/applications')}
                className="mt-4 text-blue-600 text-sm hover:underline font-medium"
              >
                View Applications →
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">File</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Size</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Uploaded</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((doc) => {
                  const cfg = DOC_STATUS[doc.status] ?? { color: 'bg-gray-100 text-gray-700', label: doc.status }
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{doc.documentType}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
                        {doc.fileName}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">
                        {formatBytes(doc.fileSize)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {doc.sasUrl && (
                            <a
                              href={doc.sasUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => navigate(`/applications/${doc.applicationId}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View application"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
