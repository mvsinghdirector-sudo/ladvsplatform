using ApplicantService.Models.DTOs;
using ApplicantService.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApplicantService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ApplicantsController : ControllerBase
    {
        private readonly IApplicantService _service;
        private readonly ILogger<ApplicantsController> _logger;

        public ApplicantsController(
            IApplicantService service,
            ILogger<ApplicantsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // POST api/v1/applicants/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterApplicantDto dto)
        {
            try
            {
                var result = await _service.RegisterAsync(dto);
                return Ok(new
                {
                    success = true,
                    statusCode = 200,
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    statusCode = 400,
                    error = ex.Message
                });
            }
        }

        // GET api/v1/applicants/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new
                {
                    success = false,
                    statusCode = 404,
                    error = "Applicant not found"
                });

            return Ok(new
            {
                success = true,
                statusCode = 200,
                data = result
            });
        }

        // GET api/v1/applicants
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(new
            {
                success = true,
                statusCode = 200,
                data = result
            });
        }

        // POST api/v1/applicants/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _service.LoginAsync(dto);
                return Ok(new
                {
                    success = true,
                    statusCode = 200,
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    statusCode = 400,
                    error = ex.Message
                });
            }
        }
    }
}