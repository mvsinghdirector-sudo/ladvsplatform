namespace ValidationService.Models.Entities
{
    public class ValidationResult
    {
        public int Id { get; set; }
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicantId { get; set; } = string.Empty;
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;

        // Overall Result
        public string OverallStatus { get; set; } = "Pending";
        public decimal ValidationScore { get; set; }

        // Individual Checks
        public bool FormatCheckPassed { get; set; }
        public bool SizeCheckPassed { get; set; }
        public bool ContentCheckPassed { get; set; }
        public bool DuplicateCheckPassed { get; set; }
        public bool FraudCheckPassed { get; set; }

        // Details
        public string FailureReason { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;

        // Audit
        public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;
        public string ValidatedBy { get; set; } = "System";
        public bool IsActive { get; set; } = true;
    }
}