using AdminService.Data;
using AdminService.Models.DTOs;
using AdminService.Models.Entities;
using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AdminService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            AdminDbContext db,
            IConfiguration config,
            ILogger<AdminController> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        // POST /api/v1/admin/action
        [HttpPost("action")]
        public async Task<IActionResult> TakeAction(
            [FromBody] TakeActionRequest request)
        {
            // Save audit log — immutable
            var log = new AdminActionLog
            {
                AdminId = request.AdminId,
                AdminEmail = request.AdminEmail,
                AdminRole = request.AdminRole,
                ApplicationId = request.ApplicationId,
                ApplicantId = request.ApplicantId,
                ActionType = request.ActionType,
                PreviousStatus = request.PreviousStatus,
                NewStatus = request.NewStatus,
                Remarks = request.Remarks,
                RejectionReason = request.RejectionReason,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                UserAgent = Request.Headers.UserAgent.ToString()
            };

            // Outbox event in same transaction
            var outboxEvent = new AdminOutbox
            {
                EventType = "AdminActionTaken",
                ApplicationId = request.ApplicationId,
                Payload = JsonSerializer.Serialize(new
                {
                    applicationId = request.ApplicationId,
                    applicantId = request.ApplicantId,
                    actionType = request.ActionType,
                    newStatus = request.NewStatus,
                    remarks = request.Remarks,
                    rejectionReason = request.RejectionReason,
                    adminEmail = request.AdminEmail,
                    takenAt = DateTime.UtcNow
                }),
                Status = "Pending"
            };

            await _db.AdminActionLogs.AddAsync(log);
            await _db.AdminOutbox.AddAsync(outboxEvent);
            await _db.SaveChangesAsync();

            // Publish event to Service Bus
            await PublishEventAsync("AdminActionTaken", outboxEvent.Payload);

            _logger.LogInformation(
                "Admin {AdminEmail} took action {Action} on {AppId}",
                request.AdminEmail, request.ActionType, request.ApplicationId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                StatusCode = 200,
                Data = new
                {
                    LogId = log.Id,
                    ApplicationId = log.ApplicationId,
                    ActionType = log.ActionType,
                    NewStatus = log.NewStatus,
                    ActionTakenAt = log.ActionTakenAt
                }
            });
        }

        // GET /api/v1/admin/logs/{applicationId}
        [HttpGet("logs/{applicationId}")]
        public async Task<IActionResult> GetLogs(string applicationId)
        {
            var logs = await _db.AdminActionLogs
                .Where(l => l.ApplicationId == applicationId)
                .OrderByDescending(l => l.ActionTakenAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                StatusCode = 200,
                Data = logs
            });
        }

        // GET /api/v1/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var today = DateTime.UtcNow.Date;

            var dashboard = new DashboardResponse
            {
                TotalApplications = await _db.AdminActionLogs
                    .Select(l => l.ApplicationId)
                    .Distinct().CountAsync(),
                PendingReview = await _db.AdminActionLogs
                    .Where(l => l.NewStatus == "UnderReview")
                    .CountAsync(),
                ApprovedToday = await _db.AdminActionLogs
                    .Where(l => l.NewStatus == "Approved"
                        && l.ActionTakenAt >= today)
                    .CountAsync(),
                RejectedToday = await _db.AdminActionLogs
                    .Where(l => l.NewStatus == "Rejected"
                        && l.ActionTakenAt >= today)
                    .CountAsync(),
                TotalAdmins = await _db.AdminUsers
                    .Where(u => u.IsActive).CountAsync()
            };

            return Ok(new ApiResponse<DashboardResponse>
            {
                Success = true,
                StatusCode = 200,
                Data = dashboard
            });
        }

        // GET /api/v1/admin/audit-logs
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAllAuditLogs(
            int page = 1, int pageSize = 20)
        {
            var total = await _db.AdminActionLogs.CountAsync();
            var logs = await _db.AdminActionLogs
                .OrderByDescending(l => l.ActionTakenAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                StatusCode = 200,
                Data = new
                {
                    TotalCount = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                    Logs = logs
                }
            });
        }

        private async Task PublishEventAsync(
            string eventType, string payload)
        {
            try
            {
                await using var client = new ServiceBusClient(
                    _config["ServiceBus:ConnectionString"]);
                await using var sender = client.CreateSender(
                    _config["ServiceBus:QueueName"]);

                var message = new ServiceBusMessage(payload)
                {
                    Subject = eventType,
                    ContentType = "application/json"
                };

                await sender.SendMessageAsync(message);
                _logger.LogInformation(
                    "Published {EventType} to Service Bus", eventType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to publish {EventType}", eventType);
            }
        }
    }
}