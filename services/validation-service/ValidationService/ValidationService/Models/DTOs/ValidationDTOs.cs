namespace ValidationService.Models.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }
        public string Service { get; set; } = "ValidationService";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}