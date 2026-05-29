using Azure.Messaging.ServiceBus;

namespace ValidationService.Services
{
    public class EventPublisher : IEventPublisher
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EventPublisher> _logger;

        public EventPublisher(
            IConfiguration config,
            ILogger<EventPublisher> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task PublishAsync(string eventType, string payload)
        {
            await using var client = new ServiceBusClient(
                _config["ServiceBus:ConnectionString"]);
            await using var sender = client.CreateSender(
                _config["ServiceBus:OutputQueue"]);

            var message = new ServiceBusMessage(payload)
            {
                Subject = eventType,
                ContentType = "application/json"
            };

            await sender.SendMessageAsync(message);

            _logger.LogInformation(
                "Published event {EventType} to {Queue}",
                eventType, _config["ServiceBus:OutputQueue"]);
        }
    }
}