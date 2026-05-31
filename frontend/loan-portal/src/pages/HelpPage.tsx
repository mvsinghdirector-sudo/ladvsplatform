import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'

const FAQS = [
  {
    q: 'How long does the loan approval process take?',
    a: 'Typically 3–7 business days after all required documents are submitted and verified.',
  },
  {
    q: 'What documents are required for a loan application?',
    a: 'You need to upload your Aadhaar Card, PAN Card, latest Salary Slip or ITR, and a recent Bank Statement.',
  },
  {
    q: 'What is the minimum and maximum loan amount?',
    a: 'The minimum loan amount is ₹10,000. Maximum limits vary by loan type — up to ₹50 lakhs for Home Loans.',
  },
  {
    q: 'Can I apply for multiple loans simultaneously?',
    a: 'Yes, you can have multiple active applications. However, approval depends on your credit profile and existing obligations.',
  },
  {
    q: 'How do I track my application status?',
    a: 'Visit the Dashboard or My Applications page. Each application shows its current status with a detailed timeline on the detail page.',
  },
  {
    q: 'What file formats are accepted for document uploads?',
    a: 'We accept PDF, JPG, and PNG files. Each file must be under 5 MB.',
  },
  {
    q: 'What happens if my application is rejected?',
    a: 'You will be notified with a reason. You may reapply after 30 days or contact our support team for guidance.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-blue-600 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
          {a}
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-500 text-sm mt-0.5">Find answers or get in touch with us</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Mail,           label: 'Email Support',  value: 'support@ladvs.in',   color: 'bg-blue-50 text-blue-600' },
            { icon: Phone,          label: 'Phone Support',  value: '1800-123-4567',       color: 'bg-green-50 text-green-600' },
            { icon: MessageCircle,  label: 'Live Chat',      value: 'Available 9am–6pm',   color: 'bg-purple-50 text-purple-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <Icon size={18} />
              </div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
              <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
