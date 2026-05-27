namespace ApplicationService.Models.Entities
{
    public class LoanApplication
    {
        public int Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;

        // Applicant Reference (no FK — microservice rule)
        public string ApplicantId { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string ApplicantEmail { get; set; } = string.Empty;
        public string ApplicantPhone { get; set; } = string.Empty;

        // Loan Details
        public string LoanType { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public int TenureMonths { get; set; }
        public decimal InterestRate { get; set; }
        public decimal MonthlyEMI { get; set; }

        // Employment
        public string EmploymentType { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }

        // Status
        public string Status { get; set; } = "Submitted";
        public string Remarks { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        // Outbox (for Service Bus events)
        public ICollection<ApplicationOutbox> OutboxEvents { get; set; } = new List<ApplicationOutbox>();
    }
}