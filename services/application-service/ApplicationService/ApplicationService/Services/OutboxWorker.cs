using ApplicationService.Data;
using ApplicationService.Models.Entities;
using Azure.Messaging.ServiceBus;
using Microsoft.EntityFrameworkCore;

namespace ApplicationService.Services
{
    public class OutboxWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<OutboxWorker> _logger;
        private readonly IConfiguration _configuration;

        public OutboxWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<OutboxWorker> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OutboxWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOutboxEvents(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing outbox events.");
                }

                // Run every 10 seconds
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task ProcessOutboxEvents(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var pendingEvents = await db.ApplicationOutbox
                .Where(e => e.Status == "Pending")
                .Take(10)
                .ToListAsync(stoppingToken);

            if (!pendingEvents.Any()) return;

            var connectionString = _configuration
                .GetConnectionString("ServiceBus");

            await using var client = new ServiceBusClient(connectionString);
            await using var sender = client.CreateSender("application-events");

            foreach (var outboxEvent in pendingEvents)
            {
                try
                {
                    var message = new ServiceBusMessage(outboxEvent.Payload)
                    {
                        Subject = outboxEvent.EventType,
                        MessageId = outboxEvent.Id.ToString()
                    };

                    await sender.SendMessageAsync(message, stoppingToken);

                    outboxEvent.Status = "Processed";
                    outboxEvent.ProcessedAt = DateTime.UtcNow;

                    _logger.LogInformation(
                        "Event {EventType} published for ApplicationId {Id}",
                        outboxEvent.EventType, outboxEvent.ApplicationId);
                }
                catch (Exception ex)
                {
                    outboxEvent.Status = "Failed";
                    outboxEvent.ErrorMessage = ex.Message;
                    _logger.LogError(ex, "Failed to publish event {Id}", outboxEvent.Id);
                }
            }

            await db.SaveChangesAsync(stoppingToken);
        }
    }
}