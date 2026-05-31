import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { applicantApi } from '../../api/applicant'
import toast from 'react-hot-toast'
import {
  User,
  Shield,
  Briefcase,
  CreditCard,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

// ── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName:            z.string().min(3, 'Full name required'),
  firstName:           z.string().min(1, 'First name required'),
  lastName:            z.string().min(1, 'Last name required'),
  email:               z.string().email('Invalid email'),
  phone:               z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  password:            z.string().min(8, 'Minimum 8 characters'),
  panNumber:           z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  aadhaarNumber:       z.string().regex(/^[2-9]\d{11}$/, 'Invalid Aadhaar (12 digits)'),
  dateOfBirth:         z.string().min(1, 'Date of birth required'),
  gender:              z.string().min(1, 'Gender required'),
  employmentType:      z.string().min(1, 'Employment type required'),
  companyName:         z.string().min(1, 'Company name required'),
  monthlyIncome:       z.number({ error: 'Enter monthly income' }).min(1, 'Income must be > 0'),
  requestedLoanAmount: z.number({ error: 'Enter loan amount' }).min(10000, 'Minimum ₹10,000'),
  loanType:            z.string().min(1, 'Loan type required'),
  loanTenureMonths:    z.number().min(1).max(360),
  addressLine1:        z.string().min(1, 'Address required'),
  city:                z.string().min(1, 'City required'),
  state:               z.string().min(1, 'State required'),
  postalCode:          z.string().min(6, 'Valid postal code required'),
})

type RegisterForm = z.infer<typeof registerSchema>

// ── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal',   icon: User },
  { id: 2, label: 'KYC',        icon: Shield },
  { id: 3, label: 'Employment', icon: Briefcase },
  { id: 4, label: 'Loan',       icon: CreditCard },
  { id: 5, label: 'Address',    icon: MapPin },
]

const STEP_FIELDS: Record<number, (keyof RegisterForm)[]> = {
  1: ['fullName', 'firstName', 'lastName', 'email', 'phone', 'password'],
  2: ['panNumber', 'aadhaarNumber', 'dateOfBirth', 'gender'],
  3: ['employmentType', 'companyName', 'monthlyIncome'],
  4: ['loanType', 'requestedLoanAmount', 'loanTenureMonths'],
  5: ['addressLine1', 'city', 'state', 'postalCode'],
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'

const selectCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors'

// ── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(1)
  const [showPw, setShowPw]   = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      monthlyIncome:       0,
      requestedLoanAmount: 0,
      loanTenureMonths:    12,
    },
  })

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => Math.min(s + 1, 5))
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      const payload = { ...data, maritalStatus: 'Single' }
      const response = await applicantApi.register(payload)
      if (response.success) {
        toast.success('Account created! Please sign in.')
        navigate('/login')
      } else {
        toast.error(response.error || 'Registration failed. Please try again.')
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        'Registration failed'
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Hero ── */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d2347 40%, #0a3d6b 70%, #0d5c9e 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #1e40af 0%, transparent 50%)' }}
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

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Start Your Loan Journey Today
          </h1>
          <p className="text-blue-200 text-base mb-8">
            Create your account in minutes and get access to competitive loan products.
          </p>

          {/* Step preview */}
          <div className="space-y-3">
            {STEPS.map(({ id, label, icon: Icon }) => (
              <div key={id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  id < step ? 'bg-green-500' : id === step ? 'bg-blue-500' : 'bg-white/20'
                }`}>
                  {id < step
                    ? <CheckCircle size={14} className="text-white" />
                    : <Icon size={13} className="text-white" />
                  }
                </div>
                <span className={`text-sm font-medium ${
                  id === step ? 'text-white' : id < step ? 'text-green-300' : 'text-blue-300'
                }`}>
                  Step {id}: {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-300 text-sm flex items-center gap-2">
          <Shield size={14} />
          Your data is encrypted and secure
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <div className="font-bold text-gray-900">LADVS</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-7">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 text-sm mt-0.5">Step {step} of 5 — {STEPS[step - 1].label}</p>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mb-6">
              {STEPS.map(({ id }) => (
                <div
                  key={id}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    id <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* ── Step 1: Personal Info ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <input {...register('firstName')} placeholder="Rahul" className={inputCls} />
                      <FieldError msg={errors.firstName?.message} />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <input {...register('lastName')} placeholder="Sharma" className={inputCls} />
                      <FieldError msg={errors.lastName?.message} />
                    </div>
                  </div>

                  <div>
                    <Label>Full Name</Label>
                    <input {...register('fullName')} placeholder="Rahul Sharma" className={inputCls} />
                    <FieldError msg={errors.fullName?.message} />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <input {...register('email')} type="email" placeholder="rahul@example.com" className={inputCls} />
                    <FieldError msg={errors.email?.message} />
                  </div>

                  <div>
                    <Label>Mobile Number</Label>
                    <input {...register('phone')} placeholder="9876543210" className={inputCls} />
                    <FieldError msg={errors.phone?.message} />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPw ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        className={inputCls + ' pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <FieldError msg={errors.password?.message} />
                  </div>
                </div>
              )}

              {/* ── Step 2: KYC ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>PAN Number</Label>
                    <input
                      {...register('panNumber')}
                      placeholder="ABCDE1234F"
                      className={inputCls}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <FieldError msg={errors.panNumber?.message} />
                  </div>

                  <div>
                    <Label>Aadhaar Number</Label>
                    <input {...register('aadhaarNumber')} placeholder="1234 5678 9012" className={inputCls} />
                    <FieldError msg={errors.aadhaarNumber?.message} />
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <input {...register('dateOfBirth')} type="date" className={inputCls} />
                    <FieldError msg={errors.dateOfBirth?.message} />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <select {...register('gender')} className={selectCls}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <FieldError msg={errors.gender?.message} />
                  </div>
                </div>
              )}

              {/* ── Step 3: Employment ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Employment Type</Label>
                    <select {...register('employmentType')} className={selectCls}>
                      <option value="">Select employment type</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business">Business</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                    <FieldError msg={errors.employmentType?.message} />
                  </div>

                  <div>
                    <Label>Company / Business Name</Label>
                    <input {...register('companyName')} placeholder="Acme Corp" className={inputCls} />
                    <FieldError msg={errors.companyName?.message} />
                  </div>

                  <div>
                    <Label>Monthly Income (₹)</Label>
                    <input
                      {...register('monthlyIncome', { valueAsNumber: true })}
                      type="number"
                      placeholder="75000"
                      className={inputCls}
                    />
                    <FieldError msg={errors.monthlyIncome?.message} />
                  </div>
                </div>
              )}

              {/* ── Step 4: Loan Details ── */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>Loan Type</Label>
                    <select {...register('loanType')} className={selectCls}>
                      <option value="">Select loan type</option>
                      <option value="Personal">Personal Loan</option>
                      <option value="Home">Home Loan</option>
                      <option value="Car">Car Loan</option>
                      <option value="Business">Business Loan</option>
                      <option value="Education">Education Loan</option>
                    </select>
                    <FieldError msg={errors.loanType?.message} />
                  </div>

                  <div>
                    <Label>Requested Loan Amount (₹)</Label>
                    <input
                      {...register('requestedLoanAmount', { valueAsNumber: true })}
                      type="number"
                      placeholder="500000"
                      className={inputCls}
                    />
                    <FieldError msg={errors.requestedLoanAmount?.message} />
                  </div>

                  <div>
                    <Label>Loan Tenure (months)</Label>
                    <input
                      {...register('loanTenureMonths', { valueAsNumber: true })}
                      type="number"
                      placeholder="24"
                      min={1}
                      max={360}
                      className={inputCls}
                    />
                    <FieldError msg={errors.loanTenureMonths?.message} />
                  </div>
                </div>
              )}

              {/* ── Step 5: Address ── */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label>Address Line 1</Label>
                    <input {...register('addressLine1')} placeholder="123, MG Road" className={inputCls} />
                    <FieldError msg={errors.addressLine1?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <input {...register('city')} placeholder="Mumbai" className={inputCls} />
                      <FieldError msg={errors.city?.message} />
                    </div>
                    <div>
                      <Label>State</Label>
                      <input {...register('state')} placeholder="Maharashtra" className={inputCls} />
                      <FieldError msg={errors.state?.message} />
                    </div>
                  </div>

                  <div>
                    <Label>Postal Code</Label>
                    <input {...register('postalCode')} placeholder="400001" className={inputCls} />
                    <FieldError msg={errors.postalCode?.message} />
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex gap-3 mt-7">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account…' : 'Create Account'}
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
