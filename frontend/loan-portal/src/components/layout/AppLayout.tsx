import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderOpen,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications',  icon: FileText,         label: 'My Applications' },
  { to: '/apply',         icon: PlusCircle,       label: 'Apply for Loan' },
  { to: '/documents',     icon: FolderOpen,       label: 'Documents' },
  { to: '/profile',       icon: User,             label: 'Profile' },
  { to: '/notifications', icon: Bell,             label: 'Notifications', badge: true },
  { to: '/help',          icon: HelpCircle,       label: 'Help & Support' },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f2f5' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #0d2347 50%, #0a3d6b 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-base">L</span>
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight">LADVS</div>
            <div className="text-blue-300 text-[10px] truncate">Loan Portal</div>
          </div>
          <button
            className="ml-auto lg:hidden text-blue-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1">
              Main Menu
            </p>
          </div>
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* User Footer */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-semibold truncate">{user?.fullName}</div>
            <div className="text-blue-300 text-xs">Applicant</div>
          </div>
          <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: '#0a1628', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-blue-200">
            <Menu size={20} />
          </button>
          <div className="text-white font-bold text-sm">LADVS</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
