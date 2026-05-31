using ApplicantService.DTOs;

namespace ApplicantService.Services
{
    public interface IChatBotService
    {
        Task<ChatResponse> GetResponseAsync(ChatRequest request);
    }
}