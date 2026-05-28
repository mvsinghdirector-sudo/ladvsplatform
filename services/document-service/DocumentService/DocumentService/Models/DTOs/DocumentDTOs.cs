namespace DocumentService.Models.DTOs
{
    public class DocumentUploadResponse
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string Status { get; set; } = string.Empty;
        public string SasUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }
        public string Service { get; set; } = "DocumentService";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}