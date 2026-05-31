using ApplicantService.DTOs;
using ApplicantService.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApplicantService.Controllers
{
    [ApiController]
    [Route("api/v1/chatbot")]
    public class ChatBotController : ControllerBase
    {
        private readonly IChatBotService _chatBotService;
        private readonly ILogger<ChatBotController> _logger;

        public ChatBotController(IChatBotService chatBotService,
            ILogger<ChatBotController> logger)
        {
            _chatBotService = chatBotService;
            _logger = logger;
        }

        // POST /api/v1/chatbot/message
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Message cannot be empty"
                });

            _logger.LogInformation("ChatBot message received: {Message}",
                request.Message);

            var response = await _chatBotService.GetResponseAsync(request);

            return Ok(new
            {
                Success = true,
                StatusCode = 200,
                Data = response,
                Message = "Response generated"
            });
        }

        // GET /api/v1/chatbot/health
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                Success = true,
                StatusCode = 200,
                Data = new
                {
                    Service = "ChatBotService",
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow
                }
            });
        }
    }
}