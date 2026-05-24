using ApplicantService.Data;
using ApplicantService.Models.DTOs;
using ApplicantService.Models.Entities;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace ApplicantService.Services
{
    public interface IApplicantService
    {
        Task<ApplicantResponseDto> RegisterAsync(RegisterApplicantDto dto);
        Task<ApplicantResponseDto?> GetByIdAsync(int id);
        Task<List<ApplicantResponseDto>> GetAllAsync();
        Task<LoginResponseDto> LoginAsync(LoginDto dto);
    }

    public class ApplicantServiceImpl : IApplicantService
    {
        private readonly ApplicantDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ApplicantServiceImpl> _logger;
        private readonly IConfiguration _configuration;   // ADD THIS

        public ApplicantServiceImpl(
            ApplicantDbContext context,
            IMapper mapper,
            ILogger<ApplicantServiceImpl> logger,
            IConfiguration configuration)               // ADD THIS
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _configuration = configuration;             // ADD THIS
        }

        public async Task<ApplicantResponseDto> RegisterAsync(RegisterApplicantDto dto)
        {
            _logger.LogInformation("Registering new applicant: {Email}", dto.Email);

            // Check duplicate email
            var exists = await _context.Applicants
                .AnyAsync(a => a.Email == dto.Email);

            if (exists)
                throw new InvalidOperationException(
                    $"Applicant with email {dto.Email} already exists.");

            // Check duplicate PAN
            var panExists = await _context.Applicants
                .AnyAsync(a => a.PanNumber == dto.PanNumber);

            if (panExists)
                throw new InvalidOperationException(
                    $"Applicant with PAN {dto.PanNumber} already exists.");

            var applicant = _mapper.Map<Applicant>(dto);

            // Generate salt and hash password
            var salt = Guid.NewGuid().ToString();
            applicant.Salt = salt;
            applicant.PasswordHash = HashPassword(dto.Password, salt);
            _context.Applicants.Add(applicant);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Applicant registered successfully with Id: {Id}",
                applicant.Id);

            return _mapper.Map<ApplicantResponseDto>(applicant);
        }

        public async Task<ApplicantResponseDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching applicant with Id: {Id}", id);

            var applicant = await _context.Applicants
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            return applicant == null ? null : _mapper.Map<ApplicantResponseDto>(applicant);
        }

        public async Task<List<ApplicantResponseDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all applicants");

            var applicants = await _context.Applicants
                .Where(a => !a.IsDeleted && a.IsActive)
                .ToListAsync();

            return _mapper.Map<List<ApplicantResponseDto>>(applicants);
        }
        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            _logger.LogInformation("Login attempt for: {Email}", dto.Email);

            var applicant = await _context.Applicants
                .FirstOrDefaultAsync(a => a.Email == dto.Email && !a.IsDeleted);

            if (applicant == null)
                throw new InvalidOperationException("Invalid email or password.");

            // Verify password
            var passwordHash = HashPassword(dto.Password, applicant.Salt);
            if (passwordHash != applicant.PasswordHash)
                throw new InvalidOperationException("Invalid email or password.");

            // Generate JWT
            var token = GenerateJwtToken(applicant);

            return new LoginResponseDto
            {
                Token = token,
                FullName = applicant.FullName,
                Email = applicant.Email,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }

        private string HashPassword(string password, string salt)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var combined = password + salt;
            var bytes = System.Text.Encoding.UTF8.GetBytes(combined);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string GenerateJwtToken(Applicant applicant)
        {
            var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

            var credentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                key, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new System.Security.Claims.Claim("id", applicant.Id.ToString()),
        new System.Security.Claims.Claim("email", applicant.Email),
        new System.Security.Claims.Claim("name", applicant.FullName)
    };

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
            );

            return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}