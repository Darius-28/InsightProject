using SupportDesk.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SupportDesk.Application.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto> CreateTicketAsync(TicketDto ticketDto);
        Task<TicketDto> GetTicketByIdAsync(Guid id);
        Task<List<TicketDto>> GetAllTicketsAsync();
        Task UpdateTicketAsync(TicketDto ticketDto);
        Task DeleteTicketAsync(Guid id);
        Task<List<TicketDto>> GetTicketsByCategoryAsync(string categoryName);
    }
}
