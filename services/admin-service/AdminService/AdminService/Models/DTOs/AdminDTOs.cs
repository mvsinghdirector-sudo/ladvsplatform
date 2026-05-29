namespace AdminService.Models.DTOs
{
    public class TakeActionRequest
    {
        public string AdminId { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminRole { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicantId { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
    }

    public class DashboardResponse
    {
        public int TotalApplications { get; set; }
        public int PendingReview { get; set; }
        public int ApprovedToday { get; set; }
        public int RejectedToday { get; set; }
        public int TotalAdmins { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }
        public string Service { get; set; } = "AdminService";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}