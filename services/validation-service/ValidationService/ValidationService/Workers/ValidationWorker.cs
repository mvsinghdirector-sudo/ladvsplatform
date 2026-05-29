using Azure.Messaging.ServiceBus;
using System.Text.Json;
using ValidationService.Data;
using ValidationService.Models.Entities;
using ValidationService.Services;

namespace ValidationService.Workers
{
    public class ValidationWorker : BackgroundService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ValidationWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private ServiceBusClient? _client;
        private ServiceBusProcessor? _processor;

        public ValidationWorker(
            IConfiguration config,
            ILogger<ValidationWorker> logger,
            IServiceProvider serviceProvider)
        {
            _config = config;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            try
            {
                _logger.LogInformation("ValidationWorker starting...");

                _client = new ServiceBusClient(
                    _config["ServiceBus:ConnectionString"]);

                _processor = _client.CreateProcessor(
                    _config["ServiceBus:InputQueue"],
                    new ServiceBusProcessorOptions
                    {
                        MaxConcurrentCalls = 2,
                        AutoCompleteMessages = false
                    });

                _processor.ProcessMessageAsync += ProcessMessageAsync;
                _processor.ProcessErrorAsync += ProcessErrorAsync;

                await _processor.StartProcessingAsync(stoppingToken);

                _logger.LogInformation(
                    "ValidationWorker started — listening on: {Queue}",
                    _config["ServiceBus:InputQueue"]);

                while (!stoppingToken.IsCancellationRequested)
                    await Task.Delay(1000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ValidationWorker failed to start");
                throw;
            }
        }

        private async Task ProcessMessageAsync(
            ProcessMessageEventArgs args)
        {
            var body = args.Message.Body.ToString();
            var eventType = args.Message.Subject ?? "Unknown";

            _logger.LogInformation(
                "Received: {EventType} — Body: {Body}",
                eventType, body);

            try
            {
                if (eventType == "DocumentUploaded")
                {
                    var payload = JsonSerializer
                        .Deserialize<Dictionary<string, string>>(body);

                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider
                        .GetRequiredService<ValidationDbContext>();
                    var engine = scope.ServiceProvider
                        .GetRequiredService<IValidationEngine>();
                    var publisher = scope.ServiceProvider
                        .GetRequiredService<IEventPublisher>();

                    // Run validation
                    var result = await engine.ValidateDocumentAsync(
                        payload!["applicationId"],
                        payload!["applicantId"],
                        payload!["documentId"],
                        payload!["documentType"],
                        payload!["blobUrl"]);

                    // Save result + outbox in one transaction
                    var outboxEvent = new ValidationOutbox
                    {
                        EventType = "ValidationCompleted",
                        ApplicationId = result.ApplicationId,
                        Payload = JsonSerializer.Serialize(new
                        {
                            applicationId = result.ApplicationId,
                            applicantId = result.ApplicantId,
                            documentId = result.DocumentId,
                            documentType = result.DocumentType,
                            validationStatus = result.OverallStatus,
                            validationScore = result.ValidationScore,
                            failureReason = result.FailureReason
                        }),
                        Status = "Pending"
                    };

                    await db.ValidationResults.AddAsync(result);
                    await db.ValidationOutbox.AddAsync(outboxEvent);
                    await db.SaveChangesAsync();

                    // Publish ValidationCompleted event
                    await publisher.PublishAsync(
                        "ValidationCompleted",
                        outboxEvent.Payload);

                    _logger.LogInformation(
                        "Validation completed for App {AppId} — {Status}",
                        result.ApplicationId, result.OverallStatus);
                }

                await args.CompleteMessageAsync(args.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process validation message");
                await args.AbandonMessageAsync(args.Message);
            }
        }

        private Task ProcessErrorAsync(ProcessErrorEventArgs args)
        {
            _logger.LogError(args.Exception,
                "Service Bus error: {Source}", args.ErrorSource);
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