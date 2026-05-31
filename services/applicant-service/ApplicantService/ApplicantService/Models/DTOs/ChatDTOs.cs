namespace ApplicantService.DTOs
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? ApplicantName { get; set; }
        public string? ApplicationId { get; set; }
        public string? LoanType { get; set; }
        public decimal? LoanAmount { get; set; }
        public string? ApplicationStatus { get; set; }
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsSuccess { get; set; } = true;
    }
}