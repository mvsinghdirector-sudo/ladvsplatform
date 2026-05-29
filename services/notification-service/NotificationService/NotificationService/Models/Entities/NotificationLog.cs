namespace NotificationService.Models.Entities
{
    public class NotificationLog
    {
        public string id { get; set; } = Guid.NewGuid().ToString();
        public string applicantId { get; set; } = string.Empty;
        public string applicationId { get; set; } = string.Empty;
        public string channel { get; set; } = string.Empty; // SMS, Email, WhatsApp
        public string eventType { get; set; } = string.Empty;
        public string recipient { get; set; } = string.Empty;
        public string subject { get; set; } = string.Empty;
        public string message { get; set; } = string.Empty;
        public string status { get; set; } = "Pending"; // Pending, Sent, Failed
        public string errorMessage { get; set; } = string.Empty;
        public DateTime sentAt { get; set; } = DateTime.UtcNow;
        public bool isDeleted { get; set; } = false;
    }
}