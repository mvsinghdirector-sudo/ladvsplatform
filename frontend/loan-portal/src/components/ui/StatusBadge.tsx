type ApplicationStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'DocumentsPending'
  | 'Approved'
  | 'Rejected'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; dot: string }
> = {
  Submitted:        { label: 'Submitted',    color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  UnderReview:      { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  DocumentsPending: { label: 'Docs Pending', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  Approved:         { label: 'Approved',     color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  Rejected:         { label: 'Rejected',     color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

const FALLBACK = { label: '', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' }

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as ApplicationStatus] ?? { ...FALLBACK, label: status }
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = getStatusConfig(status)
  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${textSize} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
