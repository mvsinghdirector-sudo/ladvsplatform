using ApplicantService.Models.DTOs;
using FluentValidation;

namespace ApplicantService.Validators
{
    public class RegisterApplicantValidator : AbstractValidator<RegisterApplicantDto>
    {
        public RegisterApplicantValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required.")
                .Matches(@"^[6-9]\d{9}$")
                .WithMessage("Invalid Indian mobile number. Must be 10 digits starting with 6-9.");

            RuleFor(x => x.PanNumber)
                .NotEmpty().WithMessage("PAN number is required.")
                .Matches(@"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
                .WithMessage("Invalid PAN format. Example: ABCDE1234F");

            // Aadhaar Validation
            RuleFor(x => x.AadhaarNumber)
                .NotEmpty().WithMessage("Aadhaar number is required.")
                .Length(12).WithMessage("Aadhaar number must be exactly 12 digits.")
                .Matches(@"^[2-9]{1}[0-9]{11}$")
                .WithMessage("Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
                .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");

            RuleFor(x => x.DateOfBirth)
                .NotEmpty().WithMessage("Date of birth is required.")
                .Must(dob => DateTime.UtcNow.Year - dob.Year >= 18)
                .WithMessage("Applicant must be at least 18 years old.");

            RuleFor(x => x.MonthlyIncome)
                .GreaterThan(0).WithMessage("Monthly income must be greater than 0.");

            RuleFor(x => x.RequestedLoanAmount)
                .GreaterThan(0).WithMessage("Loan amount must be greater than 0.");

            RuleFor(x => x.LoanTenureMonths)
                .GreaterThan(0).WithMessage("Loan tenure must be greater than 0.")
                .LessThanOrEqualTo(360).WithMessage("Loan tenure cannot exceed 360 months (30 years).");
        }
    }
}