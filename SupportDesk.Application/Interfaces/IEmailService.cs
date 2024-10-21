using SupportDesk.Application.DTOs;

namespace SupportDesk.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendTicketCreationEmailAsync(TicketDto ticket, string recipientEmail);
    }
}