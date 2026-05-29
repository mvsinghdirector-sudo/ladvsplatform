using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValidationService.Data;
using ValidationService.Models.DTOs;

namespace ValidationService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ValidationController : ControllerBase
    {
        private readonly ValidationDbContext _db;
        private readonly ILogger<ValidationController> _logger;

        public ValidationController(
            ValidationDbContext db,
            ILogger<ValidationController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // GET /api/v1/validation/{applicationId}
        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetByApplicationId(
            string applicationId)
        {
            var results = await _db.ValidationResults
                .Where(v => v.ApplicationId == applicationId)
                .OrderByDescending(v => v.ValidatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                StatusCode = 200,
                Data = new
                {
                    ApplicationId = applicationId,
                    TotalDocuments = results.Count,
                    PassedCount = results.Count(r =>
                        r.OverallStatus == "Passed"),
                    FailedCount = results.Count(r =>
                        r.OverallStatus == "Failed"),
                    OverallPassed = results.All(r =>
                        r.OverallStatus == "Passed"),
                    Results = results
                }
            });
        }

        // GET /api/v1/validation/{applicationId}/summary
        [HttpGet("{applicationId}/summary")]
        public async Task<IActionResult> GetSummary(string applicationId)
        {
            var results = await _db.ValidationResults
                .Where(v => v.ApplicationId == applicationId)
                .ToListAsync();

            var overallPassed = results.Any() &&
                results.All(r => r.OverallStatus == "Passed");

            return Ok(new ApiResponse<object>
            {
                Success = true,
                StatusCode = 200,
                Data = new
                {
                    ApplicationId = applicationId,
                    OverallStatus = overallPassed ? "Passed" : "Failed",
                    TotalDocuments = results.Count,
                    PassedDocuments = results.Count(r =>
                        r.OverallStatus == "Passed"),
                    AverageScore = results.Any()
                        ? results.Average(r => r.ValidationScore) : 0,
                    LastValidatedAt = results.Any()
                        ? results.Max(r => r.ValidatedAt) : DateTime.MinValue
                }
            });
        }
    }
}