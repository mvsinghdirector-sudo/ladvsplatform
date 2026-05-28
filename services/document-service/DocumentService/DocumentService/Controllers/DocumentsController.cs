using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using DocumentService.Models.DTOs;
using DocumentService.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Collections.Concurrent;
using System.ComponentModel;

namespace DocumentService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly CosmosClient _cosmosClient;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _config;
        private readonly ILogger<DocumentsController> _logger;

        private Microsoft.Azure.Cosmos.Container CosmosContainer =>
            _cosmosClient.GetContainer(
                _config["CosmosDB:DatabaseName"],
                _config["CosmosDB:ContainerName"]);

        public DocumentsController(
            CosmosClient cosmosClient,
            BlobServiceClient blobServiceClient,
            IConfiguration config,
            ILogger<DocumentsController> logger)
        {
            _cosmosClient = cosmosClient;
            _blobServiceClient = blobServiceClient;
            _config = config;
            _logger = logger;
        }

        // POST /api/v1/documents/upload
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(
            [FromForm] string applicationId,
            [FromForm] string applicantId,
            [FromForm] string documentType,
            IFormFile file)
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Error = "No file provided"
                });

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Error = "File size cannot exceed 10MB"
                });

            var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Error = "Only PDF, JPG, PNG files allowed"
                });

            // Upload to Blob Storage
            var blobName = $"{applicationId}/{documentType}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var containerClient = _blobServiceClient.GetBlobContainerClient(
                _config["BlobStorage:ContainerName"]);
            var blobClient = containerClient.GetBlobClient(blobName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders
                {
                    ContentType = file.ContentType
                });
            }

            // Generate SAS URL (15 min expiry)
            var sasUrl = blobClient.GenerateSasUri(
                BlobSasPermissions.Read,
                DateTimeOffset.UtcNow.AddMinutes(15)).ToString();

            // Save metadata to Cosmos DB
            var metadata = new DocumentMetadata
            {
                applicationId = applicationId,
                applicantId = applicantId,
                documentType = documentType,
                fileName = blobName,
                originalFileName = file.FileName,
                fileSize = file.Length,
                contentType = file.ContentType,
                blobUrl = blobClient.Uri.ToString(),
                status = "Uploaded"
            };

            await CosmosContainer.CreateItemAsync(
                metadata,
                new PartitionKey(applicationId));


            _logger.LogInformation(
                "Document {DocType} uploaded for Application {AppId}",
                documentType, applicationId);

            return Ok(new ApiResponse<DocumentUploadResponse>
            {
                Success = true,
                StatusCode = 200,
                Data = new DocumentUploadResponse
                {
                    Id = metadata.id,
                    ApplicationId = metadata.applicationId,
                    DocumentType = metadata.documentType,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    Status = "Uploaded",
                    SasUrl = sasUrl,
                    UploadedAt = metadata.uploadedAt
                }
            });
        }

        // GET /api/v1/documents/{applicationId}
        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetByApplicationId(string applicationId)
        {
            var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.applicationId = @appId AND c.isDeleted = false")
            .WithParameter("@appId", applicationId);

            var results = new List<DocumentMetadata>();
            var iterator = CosmosContainer.GetItemQueryIterator<DocumentMetadata>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return Ok(new ApiResponse<List<DocumentMetadata>>
            {
                Success = true,
                StatusCode = 200,
                Data = results
            });
        }
    }
}