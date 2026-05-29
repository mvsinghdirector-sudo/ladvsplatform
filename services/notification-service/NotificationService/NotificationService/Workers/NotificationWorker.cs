using Azure.Messaging.ServiceBus;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Workers
{
    public class NotificationWorker : BackgroundService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<NotificationWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private ServiceBusClient? _client;
        private ServiceBusProcessor? _processor;

        public NotificationWorker(
            IConfiguration config,
            ILogger<NotificationWorker> logger,
            IServiceProvider serviceProvider)
        {
            _config = config;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                _logger.LogInformation("NotificationWorker starting...");

                _client = new ServiceBusClient(
                    _config["ServiceBus:ConnectionString"]);

                _logger.LogInformation("Service Bus client created");

                _processor = _client.CreateProcessor(
                    _config["ServiceBus:QueueName"],
                    new ServiceBusProcessorOptions
                    {
                        MaxConcurrentCalls = 1,
                        AutoCompleteMessages = false
                    });

                _processor.ProcessMessageAsync += ProcessMessageAsync;
                _processor.ProcessErrorAsync += ProcessErrorAsync;

                await _processor.StartProcessingAsync(stoppingToken);

                _logger.LogInformation(
                    "NotificationWorker started — listening on queue: {Queue}",
                    _config["ServiceBus:QueueName"]);

                while (!stoppingToken.IsCancellationRequested)
                    await Task.Delay(1000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationWorker FAILED to start");
                throw;
            }
        }

        private async Task ProcessMessageAsync(ProcessMessageEventArgs args)
        {
            var body = args.Message.Body.ToString();
            var eventType = args.Message.Subject ?? "Unknown";

            _logger.LogInformation("Received event: {EventType}", eventType);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var notificationSvc = scope.ServiceProvider
                    .GetRequiredService<INotificationSender>();

                var payload = JsonSerializer.Deserialize<Dictionary<string, string>>(body);

                switch (eventType)
                {
                    case "ApplicationCreated":
                        await notificationSvc.SendApplicationCreatedAsync(payload!);
                        break;
                    case "ValidationCompleted":
                        await notificationSvc.SendValidationCompletedAsync(payload!);
                        break;
                    case "ApplicationApproved":
                        await notificationSvc.SendApplicationApprovedAsync(payload!);
                        break;
                    case "ApplicationRejected":
                        await notificationSvc.SendApplicationRejectedAsync(payload!);
                        break;
                    default:
                        _logger.LogWarning("Unknown event type: {EventType}", eventType);
                        break;
                }

                await args.CompleteMessageAsync(args.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process event {EventType}", eventType);
                await args.AbandonMessageAsync(args.Message);
            }
        }

        private Task ProcessErrorAsync(ProcessErrorEventArgs args)
        {
            _logger.LogError(
                "Service Bus error — Source: {Source}, Reason: {Reason}, Message: {Message}",
                args.ErrorSource,
                args.Exception.GetType().Name,
                args.Exception.Message);
            return Task.CompletedTask;
        }

        public override void Dispose()
        {
            _processor?.DisposeAsync().AsTask().Wait();
            _client?.DisposeAsync().AsTask().Wait();
            base.Dispose();
        }
    }
}