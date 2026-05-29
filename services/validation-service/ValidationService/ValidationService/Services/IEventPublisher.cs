namespace ValidationService.Services
{
    public interface IEventPublisher
    {
        Task PublishAsync(string eventType, string payload);
    }
}