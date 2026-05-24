using ApplicantService.Models.DTOs;
using ApplicantService.Models.Entities;
using AutoMapper;

namespace ApplicantService.Services
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // RegisterApplicantDto → Applicant Entity
            CreateMap<RegisterApplicantDto, Applicant>()
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive,
                    opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.IsDeleted,
                    opt => opt.MapFrom(_ => false))
                .ForMember(dest => dest.ApplicationStatus,
                    opt => opt.MapFrom(_ => "Pending"));

            // Applicant Entity → ApplicantResponseDto
            CreateMap<Applicant, ApplicantResponseDto>();
        }
    }
}