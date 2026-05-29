using ValidationService.Models.Entities;

namespace ValidationService.Services
{
    public class ValidationEngine : IValidationEngine
    {
        private readonly ILogger<ValidationEngine> _logger;

        public ValidationEngine(ILogger<ValidationEngine> logger)
        {
            _logger = logger;
        }

        public async Task<ValidationResult> ValidateDocumentAsync(
            string applicationId,
            string applicantId,
            string documentId,
            string documentType,
            string blobUrl)
        {
            _logger.LogInformation(
                "Starting validation for Document {DocId} Type {DocType}",
                documentId, documentType);

            var result = new ValidationResult
            {
                ApplicationId = applicationId,
                ApplicantId = applicantId,
                DocumentId = documentId,
                DocumentType = documentType,
                ValidatedBy = "System"
            };

            // Run all checks
            result.FormatCheckPassed = await RunFormatCheckAsync(documentType, blobUrl);
            result.SizeCheckPassed = await RunSizeCheckAsync(blobUrl);
            result.ContentCheckPassed = await RunContentCheckAsync(documentType);
            result.DuplicateCheckPassed = await RunDuplicateCheckAsync(documentId);
            result.FraudCheckPassed = await RunFraudCheckAsync(documentType, blobUrl);

            // Calculate score
            var checks = new[]
            {
                result.FormatCheckPassed,
                result.SizeCheckPassed,
                result.ContentCheckPassed,
                result.DuplicateCheckPassed,
                result.FraudCheckPassed
            };

            var passedCount = checks.Count(c => c);
            result.ValidationScore = (decimal)passedCount / checks.Length * 100;

            // Set overall status
            result.OverallStatus = result.ValidationScore >= 80
                ? "Passed" : "Failed";

            if (result.OverallStatus == "Failed")
            {
                var failures = new List<string>();
                if (!result.FormatCheckPassed) failures.Add("Format");
                if (!result.SizeCheckPassed) failures.Add("Size");
                if (!result.ContentCheckPassed) failures.Add("Content");
                if (!result.DuplicateCheckPassed) failures.Add("Duplicate");
                if (!result.FraudCheckPassed) failures.Add("Fraud");
                result.FailureReason = $"Failed checks: {string.Join(", ", failures)}";
            }

            _logger.LogInformation(
                "Validation completed for {DocId} — Status: {Status}, Score: {Score}",
                documentId, result.OverallStatus, result.ValidationScore);

            return result;
        }

        private async Task<bool> RunFormatCheckAsync(
            string documentType, string blobUrl)
        {
            await Task.Delay(100); // Simulate processing
            var validFormats = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
            return validFormats.Any(f =>
                blobUrl.ToLower().Contains(f));
        }

        private async Task<bool> RunSizeCheckAsync(string blobUrl)
        {
            await Task.Delay(50);
            return true; // Already validated at upload
        }

        private async Task<bool> RunContentCheckAsync(string documentType)
        {
            await Task.Delay(200); // Simulate OCR
            // In production: call Azure Cognitive Services OCR
            return documentType is "PAN" or "Aadhaar"
                or "SalarySlip" or "BankStatement";
        }

        private async Task<bool> RunDuplicateCheckAsync(string documentId)
        {
            await Task.Delay(50);
            return true; // Check DB for duplicate document IDs
        }

        private async Task<bool> RunFraudCheckAsync(
            string documentType, string blobUrl)
        {
            await Task.Delay(300); // Simulate fraud ML model
            // In production: call Azure Form Recognizer
            return true;
        }
    }
}