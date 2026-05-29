namespace NotificationService.Services
{
    public interface INotificationSender
    {
        Task SendApplicationCreatedAsync(Dictionary<string, string> payload);
        Task SendValidationCompletedAsync(Dictionary<string, string> payload);
        Task SendApplicationApprovedAsync(Dictionary<string, string> payload);
        Task SendApplicationRejectedAsync(Dictionary<string, string> payload);
    }
}