using ApplicantService.DTOs;
using Azure;
using Azure.AI.OpenAI;
using OpenAI.Chat;

namespace ApplicantService.Services
{
    public class ChatBotService : IChatBotService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChatBotService> _logger;

        public ChatBotService(IConfiguration configuration,
            ILogger<ChatBotService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ChatResponse> GetResponseAsync(ChatRequest request)
        {
            try
            {
                var endpoint = _configuration["AzureOpenAI:Endpoint"]!;
                var apiKey = _configuration["AzureOpenAI:ApiKey"]!;
                var deployment = _configuration["AzureOpenAI:DeploymentName"]!;
                var apiVersion = _configuration["AzureOpenAI:ApiVersion"]!;

                // Match exactly what Foundry Python code uses
                var client = new AzureOpenAIClient(
                    new Uri(endpoint),
                    new AzureKeyCredential(apiKey),
                    new AzureOpenAIClientOptions(
                        AzureOpenAIClientOptions.ServiceVersion.V2024_12_01_Preview
                    ));

                var chatClient = client.GetChatClient(deployment);

                var systemPrompt = BuildSystemPrompt(request);

                var messages = new List<ChatMessage>
                {
                       new SystemChatMessage(systemPrompt),
                        new UserChatMessage(request.Message)
                };

                // No options - let model use defaults
                var response = await chatClient.CompleteChatAsync(messages);
                var reply = response.Value.Content[0].Text;

                //  var response = await chatClient.CompleteChatAsync(messages, options);
                //var reply = response.Value.Content[0].Text;

                _logger.LogInformation("ChatBot responded for: {Message}",
                    request.Message);

                return new ChatResponse
                {
                    Reply = reply,
                    IsSuccess = true,
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ChatBot error details: {Error}", ex.Message);

                return new ChatResponse
                {
                    Reply = $"Debug error: {ex.Message}",
                    IsSuccess = false,
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        private string BuildSystemPrompt(ChatRequest request)
        {
            var context = string.Empty;

            if (!string.IsNullOrEmpty(request.ApplicantName))
                context += $"\nApplicant Name: {request.ApplicantName}";

            if (!string.IsNullOrEmpty(request.ApplicationId))
                context += $"\nApplication ID: {request.ApplicationId}";

            if (!string.IsNullOrEmpty(request.LoanType))
                context += $"\nLoan Type: {request.LoanType}";

            if (request.LoanAmount.HasValue)
                context += $"\nLoan Amount: ₹{request.LoanAmount:N0}";

            if (!string.IsNullOrEmpty(request.ApplicationStatus))
                context += $"\nApplication Status: {request.ApplicationStatus}";

            return $"""
                You are a helpful loan assistant for LADVS
                (Loan Application & Document Validation System).

                You help applicants with:
                - Loan application process and steps
                - Required documents (Aadhaar, PAN, Bank Statement, Salary Slip)
                - Application status queries
                - Loan eligibility questions
                - EMI and interest rate information
                - Document upload guidance

                Loan Types available: Personal Loan, Home Loan,
                Car Loan, Education Loan, Business Loan.

                Always be:
                - Friendly and professional
                - Clear and concise
                - Helpful with specific next steps
                - Supportive in both English and Hindi if needed

                If you cannot help, direct them to:
                - Email: support@ladvs.in
                - Phone: 1800-123-4567
                - Live Chat: 9AM-6PM

                Current applicant context: {context}
                """;
        }
    }
}