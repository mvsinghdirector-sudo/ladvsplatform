import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { applicantApi } from '../../api/applicant'
import { useAuth } from '../../lib/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Zap,
  CheckCircle,
  BarChart2,
} from 'lucide-react'

const loginSchema = z.object({
  email:    z.string().min(1, 'Email or mobile number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const features = [
  {
    icon:  Shield,
    title: 'Secure & Compliant',
    desc:  'Enterprise-grade security with end-to-end encryption',
    color: 'bg-blue-500',
  },
  {
    icon:  CheckCircle,
    title: 'Smart Validation',
    desc:  'AI-powered document verification',
    color: 'bg-green-500',
  },
  {
    icon:  Zap,
    title: 'Real-time Updates',
    desc:  'Track your application status in real-time',
    color: 'bg-yellow-500',
  },
  {
    icon:  BarChart2,
    title: 'Scalable & Reliable',
    desc:  'Built on cloud-native microservices',
    color: 'bg-blue-400',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      const response = await applicantApi.login(data)
      if (response.success) {
        login({
          applicantId: response.data.applicantId ?? String(response.data.id),
          fullName:    response.data.fullName,
          email:       response.data.email,
          token:       response.data.token,
        })
        toast.success(`Welcome back, ${response.data.fullName}!`)
        await queryClient.invalidateQueries({ queryKey: ['applications'] })
        navigate('/dashboard')
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Hero Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d2347 40%, #0a3d6b 70%, #0d5c9e 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #1e40af 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 40%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">LADVS</div>
            <div className="text-blue-300 text-xs">Loan Application & Document Validation System</div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10">
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Smart Loans.{' '}
            <span className="text-blue-400">Secure Future.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-sm">
            A secure, fast and reliable platform for loan application and document validation.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`${color} rounded-lg p-2 flex-shrink-0`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{title}</div>
                  <div className="text-blue-300 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="relative z-10 flex items-center gap-2 text-blue-300 text-sm">
          <Shield size={14} />
          <span>Your trust is our priority</span>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">LADVS</div>
              <div className="text-gray-500 text-xs">Loan Application & Document Validation System</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Heading */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your applicant account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="text"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  Remember me
                </label>
                <button type="button" className="text-blue-600 hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                Microsoft
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M9 0L0 16h4.5L9 7.5 13.5 16H18L9 0z" fill="#0078D4" />
                </svg>
                Azure AD
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
