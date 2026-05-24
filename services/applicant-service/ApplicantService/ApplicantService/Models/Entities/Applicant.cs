namespace ApplicantService.Models.Entities
{
    public class Applicant
    {
        public int Id { get; set; }

        // Personal Information
        public string FullName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string MaritalStatus { get; set; } = string.Empty;
        public string Nationality { get; set; } = "Indian";

        // Contact Information
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Salt { get; set; } = string.Empty;
        public string AlternateEmail { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AlternatePhone { get; set; } = string.Empty;

        // KYC Details
        public string PanNumber { get; set; } = string.Empty;
        public string AadhaarNumber { get; set; } = string.Empty;
        public string PassportNumber { get; set; } = string.Empty;
        public string DrivingLicenseNumber { get; set; } = string.Empty;

        // Address Details
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = "India";
        public string PostalCode { get; set; } = string.Empty;

        // Employment Details
        public string EmploymentType { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
        public int WorkExperienceYears { get; set; }

        // Loan Details
        public decimal RequestedLoanAmount { get; set; }
        public string LoanType { get; set; } = string.Empty;
        public int LoanTenureMonths { get; set; }

        // Banking Details
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;

        // Validation & Status
        public bool IsKycVerified { get; set; } = false;
        public bool IsEmailVerified { get; set; } = false;
        public bool IsPhoneVerified { get; set; } = false;
        public string ApplicationStatus { get; set; } = "Pending";
        public string Remarks { get; set; } = string.Empty;

        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        // System Flags
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }
}