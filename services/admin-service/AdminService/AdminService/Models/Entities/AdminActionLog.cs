namespace AdminService.Models.Entities
{
    public class AdminActionLog
    {
        public int Id { get; set; }
        public string AdminId { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminRole { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicantId { get; set; } = string.Empty;

        // Action Details
        public string ActionType { get; set; } = string.Empty;
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;

        // Audit — immutable
        public DateTime ActionTakenAt { get; set; } = DateTime.UtcNow;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;
    }
}