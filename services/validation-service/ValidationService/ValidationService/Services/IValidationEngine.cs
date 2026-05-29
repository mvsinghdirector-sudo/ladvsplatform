using ValidationService.Models.Entities;

namespace ValidationService.Services
{
    public interface IValidationEngine
    {
        Task<ValidationResult> ValidateDocumentAsync(
            string applicationId,
            string applicantId,
            string documentId,
            string documentType,
            string blobUrl);
    }
}