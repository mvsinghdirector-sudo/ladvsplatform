import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, CheckCircle, User, FileText, Upload, Eye } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { applicationApi } from '../../api/application'
import { useAuth } from '../../lib/AuthContext'

// ── Zod Schema ──────────────────────────────────────────────────────────────
const applySchema = z.object({
  // Step 1 — Personal Info
  fullName:    z.string().min(3, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email:       z.string().email('Invalid email address'),
  phone:       z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  panNumber:   z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  aadhaarNumber: z.string().regex(/^[2-9]\d{11}$/, 'Invalid Aadhaar (12 digits)'),

  // Step 2 — Loan Details
  loanType:        z.string().min(1, 'Select a loan type'),
  requestedAmount: z.number({ error: 'Enter a valid amount' }).min(10000, 'Minimum ₹10,000'),
  tenureMonths:    z.number({ error: 'Enter tenure' }).min(1).max(360),
  employmentType:  z.string().min(1, 'Select employment type'),
  companyName:     z.string().min(1, 'Company / business name is required'),
  monthlyIncome:   z.number({ error: 'Enter monthly income' }).min(1, 'Income must be > 0'),
})

type ApplyForm = z.infer<typeof applySchema>

// ── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Loan Details',  icon: FileText },
  { id: 3, label: 'Documents',     icon: Upload },
  { id: 4, label: 'Review',        icon: Eye },
]

const STEP_FIELDS: Record<number, (keyof ApplyForm)[]> = {
  1: ['fullName', 'dateOfBirth', 'email', 'phone', 'panNumber', 'aadhaarNumber'],
  2: ['loanType', 'requestedAmount', 'tenureMonths', 'employmentType', 'companyName', 'monthlyIncome'],
}

const LOAN_TYPES = ['Personal', 'Home', 'Car', 'Business', 'Education']
const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business', 'Freelancer']

// ── Field helpers ────────────────────────────────────────────────────────────
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
export default function ApplyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    mode: 'onBlur',
    defaultValues: {
      fullName:        user?.fullName ?? '',
      email:           user?.email ?? '',
      requestedAmount: 0,
      tenureMonths:    12,
      monthlyIncome:   0,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: applicationApi.create,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['applications'] })
        toast.success('Application submitted successfully!')
        navigate(`/applications/${res.data.id}`)
      } else {
        toast.error(res.error ?? 'Submission failed')
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message ?? 'Submission failed. Please try again.')
    },
  })

  const nextStep = async () => {
    const fields = STEP_FIELDS[step]
    if (fields) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, 4))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = (data: ApplyForm) => {
    if (!user) return
    mutate({
      applicantId:    user.applicantId,
      applicantName:  data.fullName,
      applicantEmail: data.email,
      applicantPhone: data.phone,
      loanType:       data.loanType,
      requestedAmount: data.requestedAmount,
      tenureMonths:   data.tenureMonths,
      employmentType: data.employmentType,
      companyName:    data.companyName,
      monthlyIncome:  data.monthlyIncome,
    })
  }

  const values = getValues()

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto">

        {/* ── Back + Title ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Apply for Loan</h1>
            <p className="text-gray-500 text-sm">Fill in the details to apply for a new loan</p>
          </div>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center mb-8">
          {STEPS.map(({ id, label, icon: Icon }, idx) => (
            <div key={id} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    id < step
                      ? 'bg-green-500 text-white'
                      : id === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {id < step ? <CheckCircle size={16} /> : <Icon size={15} />}
                </div>
                <span
                  className={`text-xs mt-1 font-medium whitespace-nowrap ${
                    id === step ? 'text-blue-600' : id < step ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                    id < step ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Full Name</Label>
                    <input {...register('fullName')} placeholder="Rahul Sharma" className={inputCls} />
                    <FieldError msg={errors.fullName?.message} />
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <input {...register('dateOfBirth')} type="date" className={inputCls} />
                    <FieldError msg={errors.dateOfBirth?.message} />
                  </div>

                  <div>
                    <Label>Mobile Number</Label>
                    <input {...register('phone')} placeholder="+91 98765 43210" className={inputCls} />
                    <FieldError msg={errors.phone?.message} />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Email ID</Label>
                    <input {...register('email')} type="email" placeholder="rahul.sharma@email.com" className={inputCls} />
                    <FieldError msg={errors.email?.message} />
                  </div>

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
                </div>
              </div>
            )}

            {/* ── Step 2: Loan Details ── */}
            {step === 2 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Loan Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Loan Type</Label>
                    <select {...register('loanType')} className={selectCls}>
                      <option value="">Select loan type</option>
                      {LOAN_TYPES.map((t) => (
                        <option key={t} value={t}>{t} Loan</option>
                      ))}
                    </select>
                    <FieldError msg={errors.loanType?.message} />
                  </div>

                  <div>
                    <Label>Loan Amount (₹)</Label>
                    <input
                      {...register('requestedAmount', { valueAsNumber: true })}
                      type="number"
                      placeholder="500000"
                      className={inputCls}
                    />
                    <FieldError msg={errors.requestedAmount?.message} />
                  </div>

                  <div>
                    <Label>Tenure (months)</Label>
                    <input
                      {...register('tenureMonths', { valueAsNumber: true })}
                      type="number"
                      placeholder="24"
                      min={1}
                      max={360}
                      className={inputCls}
                    />
                    <FieldError msg={errors.tenureMonths?.message} />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Employment Type</Label>
                    <select {...register('employmentType')} className={selectCls}>
                      <option value="">Select employment type</option>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
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
              </div>
            )}

            {/* ── Step 3: Documents ── */}
            {step === 3 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Documents</h2>
                <p className="text-gray-500 text-sm mb-5">
                  You can upload documents after your application is submitted from the application detail page.
                </p>
                <div className="space-y-3">
                  {['Aadhaar Card', 'PAN Card', 'Salary Slip / ITR', 'Bank Statement'].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">{doc}</div>
                          <div className="text-xs text-gray-400">PDF, JPG, PNG · Max 5MB</div>
                        </div>
                      </div>
                      <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Documents can be uploaded after submission on the application detail page.
                </p>
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {step === 4 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-5">Review Your Application</h2>

                {/* Personal Info */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Info</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Full Name</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.fullName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Date of Birth</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.dateOfBirth || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Email</div>
                      <div className="font-medium text-gray-900 mt-0.5 truncate">{values.email || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Mobile</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.phone || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">PAN</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.panNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Aadhaar</div>
                      <div className="font-medium text-gray-900 mt-0.5">
                        {values.aadhaarNumber ? `XXXX XXXX ${values.aadhaarNumber.slice(-4)}` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Loan Details</h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Loan Type</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.loanType ? `${values.loanType} Loan` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Amount</div>
                      <div className="font-medium text-gray-900 mt-0.5">
                        {values.requestedAmount ? `₹${Number(values.requestedAmount).toLocaleString('en-IN')}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Tenure</div>
                      <div className="font-medium text-gray-900 mt-0.5">
                        {values.tenureMonths ? `${values.tenureMonths} months` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Employment</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.employmentType || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Company</div>
                      <div className="font-medium text-gray-900 mt-0.5">{values.companyName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Monthly Income</div>
                      <div className="font-medium text-gray-900 mt-0.5">
                        {values.monthlyIncome ? `₹${Number(values.monthlyIncome).toLocaleString('en-IN')}` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  By submitting, you confirm all details are accurate and agree to our terms.
                </p>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              )}

              {step < 4 ? (
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
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
