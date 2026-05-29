using SendGrid;
using SendGrid.Helpers.Mail;

namespace NotificationService.Services
{
    public class NotificationSender : INotificationSender
    {
        private readonly IConfiguration _config;
        private readonly ILogger<NotificationSender> _logger;

        public NotificationSender(
            IConfiguration config,
            ILogger<NotificationSender> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendApplicationCreatedAsync(
            Dictionary<string, string> payload)
        {
            var email = payload.GetValueOrDefault("applicantEmail", "");
            var appNumber = payload.GetValueOrDefault("applicationNumber", "");

            await SendEmailAsync(
                email,
                "Application Received — LADVS",
                $@"Dear Applicant,<br/><br/>
                Your loan application <b>{appNumber}</b> has been received successfully.<br/>
                We will review your documents and get back to you shortly.<br/><br/>
                Regards,<br/>LADVS Team"
            );
        }

        public async Task SendValidationCompletedAsync(
            Dictionary<string, string> payload)
        {
            var email = payload.GetValueOrDefault("applicantEmail", "");
            var appNumber = payload.GetValueOrDefault("applicationNumber", "");
            var result = payload.GetValueOrDefault("validationResult", "Completed");

            await SendEmailAsync(
                email,
                "Document Validation Update — LADVS",
                $@"Dear Applicant,<br/><br/>
                Document validation for application <b>{appNumber}</b> is {result}.<br/>
                Our team will review and contact you.<br/><br/>
                Regards,<br/>LADVS Team"
            );
        }

        public async Task SendApplicationApprovedAsync(
            Dictionary<string, string> payload)
        {
            var email = payload.GetValueOrDefault("applicantEmail", "");
            var appNumber = payload.GetValueOrDefault("applicationNumber", "");
            var amount = payload.GetValueOrDefault("approvedAmount", "");

            await SendEmailAsync(
                email,
                "Congratulations! Loan Approved — LADVS",
                $@"Dear Applicant,<br/><br/>
                Congratulations! Your loan application <b>{appNumber}</b> 
                has been <b style='color:green'>APPROVED</b>.<br/>
                Approved Amount: <b>Rs.{amount}</b><br/><br/>
                Regards,<br/>LADVS Team"
            );
        }

        public async Task SendApplicationRejectedAsync(
            Dictionary<string, string> payload)
        {
            var email = payload.GetValueOrDefault("applicantEmail", "");
            var appNumber = payload.GetValueOrDefault("applicationNumber", "");
            var reason = payload.GetValueOrDefault("rejectionReason", "");

            await SendEmailAsync(
                email,
                "Loan Application Update — LADVS",
                $@"Dear Applicant,<br/><br/>
                We regret to inform you that loan application <b>{appNumber}</b> 
                could not be approved at this time.<br/>
                Reason: {reason}<br/><br/>
                You may reapply after 30 days.<br/><br/>
                Regards,<br/>LADVS Team"
            );
        }

        private async Task SendEmailAsync(
     string to, string subject, string htmlContent)
        {
            try
            {
                if (string.IsNullOrEmpty(to))
                {
                    _logger.LogWarning("Email recipient empty — skipping");
                    return;
                }

                var apiKey = _config["SendGrid:ApiKey"];
                _logger.LogInformation(
                    "Sending email to {Email} with subject {Subject}", to, subject);

                var client = new SendGridClient(apiKey);
                var from = new EmailAddress(
                    _config["SendGrid:FromEmail"],
                    _config["SendGrid:FromName"]);
                var toEmail = new EmailAddress(to);
                var msg = MailHelper.CreateSingleEmail(
                    from, toEmail, subject, "", htmlContent);
                var response = await client.SendEmailAsync(msg);

                var responseBody = await response.Body.ReadAsStringAsync();

                _logger.LogInformation(
                    "SendGrid response — Status: {Status}, Body: {Body}",
                    response.StatusCode, responseBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email failed to {Email}", to);
            }
        }
    }
}