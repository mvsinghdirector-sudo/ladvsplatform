namespace ApplicationService.Models.Entities
{
    public class ApplicationOutbox
    {
        public int Id { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public int ApplicationId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}