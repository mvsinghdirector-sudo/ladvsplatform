namespace ApplicationService.Models.DTOs
{
    // Request — what client sends
    public class CreateApplicationRequest
    {
        public string ApplicantId { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string ApplicantEmail { get; set; } = string.Empty;
        public string ApplicantPhone { get; set; } = string.Empty;
        public string LoanType { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public int TenureMonths { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
    }

    // Response — what API returns
    public class ApplicationResponse
    {
        public int Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string LoanType { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public int TenureMonths { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // Standard API wrapper
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }
        public string Service { get; set; } = "ApplicationService";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}