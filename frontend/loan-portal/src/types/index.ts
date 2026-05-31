// Applicant Types
export interface RegisterRequest {
  fullName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  panNumber: string
  aadhaarNumber: string
  password: string
  dateOfBirth: string
  gender: string
  maritalStatus?: string
  employmentType: string
  companyName: string
  monthlyIncome: number
  requestedLoanAmount: number
  loanType: string
  loanTenureMonths: number
  addressLine1: string
  city: string
  state: string
  postalCode: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  id: number
  applicantId?: string
  fullName: string
  email: string
  phone?: string
}

// Application Types
export interface CreateApplicationRequest {
  applicantId: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  loanType: string
  requestedAmount: number
  tenureMonths: number
  employmentType: string
  companyName: string
  monthlyIncome: number
}

export interface ApplicationResponse {
  id: number
  applicationNumber: string
  applicantName: string
  loanType: string
  requestedAmount: number
  tenureMonths: number
  status: string
  createdAt: string
}

// Document Types
export interface DocumentUploadResponse {
  id: string
  applicationId: string
  documentType: string
  fileName: string
  fileSize: number
  status: string
  sasUrl: string
  uploadedAt: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  error: string | null
  service: string
  timestamp: string
}

// Auth State
export interface AuthUser {
  applicantId: string
  fullName: string
  email: string
  token: string
}