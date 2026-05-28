namespace DocumentService.Models.Entities
{
    public class DocumentMetadata
    {
        public string id { get; set; } = Guid.NewGuid().ToString();
        public string applicationId { get; set; } = string.Empty;
        public string applicantId { get; set; } = string.Empty;
        public string documentType { get; set; } = string.Empty;
        public string fileName { get; set; } = string.Empty;
        public string originalFileName { get; set; } = string.Empty;
        public long fileSize { get; set; }
        public string contentType { get; set; } = string.Empty;
        public string blobUrl { get; set; } = string.Empty;
        public string containerName { get; set; } = "documents";
        public string status { get; set; } = "Uploaded";
        public DateTime uploadedAt { get; set; } = DateTime.UtcNow;
        public bool isDeleted { get; set; } = false;
    }
}