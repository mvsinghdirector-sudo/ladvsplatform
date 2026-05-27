using ApplicationService.Data;
using ApplicationService.Models.DTOs;
using ApplicationService.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ApplicationService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<ApplicationsController> _logger;

        public ApplicationsController(ApplicationDbContext db,
            ILogger<ApplicationsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // POST /api/v1/applications
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateApplicationRequest request)
        {
            // Generate unique application number
            var appNumber = $"LADVS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

            var application = new LoanApplication
            {
                ApplicationNumber = appNumber,
                ApplicantId = request.ApplicantId,
                ApplicantName = request.ApplicantName,
                ApplicantEmail = request.ApplicantEmail,
                ApplicantPhone = request.ApplicantPhone,
                LoanType = request.LoanType,
                RequestedAmount = request.RequestedAmount,
                TenureMonths = request.TenureMonths,
                EmploymentType = request.EmploymentType,
                CompanyName = request.CompanyName,
                MonthlyIncome = request.MonthlyIncome,
                Status = "Submitted"
            };

            // Outbox event — same transaction as application save
            var outboxEvent = new ApplicationOutbox
            {
                EventType = "ApplicationCreated",
                Payload = JsonSerializer.Serialize(new
                {
                    ApplicationId = appNumber,
                    ApplicantId = request.ApplicantId,
                    LoanType = request.LoanType,
                    Amount = request.RequestedAmount
                }),
                Status = "Pending"
            };

            // Both saved in ONE transaction — never lose the event
            await _db.LoanApplications.AddAsync(application);
            await _db.ApplicationOutbox.AddAsync(outboxEvent);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Application {AppNumber} created for {Applicant}",
                appNumber, request.ApplicantName);

            return Ok(new ApiResponse<ApplicationResponse>
            {
                Success = true,
                StatusCode = 200,
                Data = new ApplicationResponse
                {
                    Id = application.Id,
                    ApplicationNumber = application.ApplicationNumber,
                    ApplicantName = application.ApplicantName,
                    LoanType = application.LoanType,
                    RequestedAmount = application.RequestedAmount,
                    TenureMonths = application.TenureMonths,
                    Status = application.Status,
                    CreatedAt = application.CreatedAt
                }
            });
        }

        // GET /api/v1/applications/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var application = await _db.LoanApplications
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (application == null)
                return NotFound(new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 404,
                    Error = "Application not found"
                });

            return Ok(new ApiResponse<ApplicationResponse>
            {
                Success = true,
                StatusCode = 200,
                Data = new ApplicationResponse
                {
                    Id = application.Id,
                    ApplicationNumber = application.ApplicationNumber,
                    ApplicantName = application.ApplicantName,
                    LoanType = application.LoanType,
                    RequestedAmount = application.RequestedAmount,
                    TenureMonths = application.TenureMonths,
                    Status = application.Status,
                    CreatedAt = application.CreatedAt
                }
            });
        }

        // GET /api/v1/applications
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var applications = await _db.LoanApplications
                .Where(a => !a.IsDeleted)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ApplicationResponse
                {
                    Id = a.Id,
                    ApplicationNumber = a.ApplicationNumber,
                    ApplicantName = a.ApplicantName,
                    LoanType = a.LoanType,
                    RequestedAmount = a.RequestedAmount,
                    TenureMonths = a.TenureMonths,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt
                }).ToListAsync();

            return Ok(new ApiResponse<List<ApplicationResponse>>
            {
                Success = true,
                StatusCode = 200,
                Data = applications
            });
        }
    }
}