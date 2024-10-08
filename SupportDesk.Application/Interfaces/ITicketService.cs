using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Application.DTOs;

namespace SupportDesk.Application.Interfaces
{
    public interface ITicketService
    {
        Task CreateTicketAsync(TicketDto ticketDto);
        Task<TicketDto> GetTicketByIdAsync(Guid id); // Changed from int to Guid
        Task<List<TicketDto>> GetAllTicketsAsync();
        Task<TicketDto> UpdateTicketAsync(TicketDto ticketDto);
        Task DeleteTicketAsync(Guid id); // Changed from int to Guid
    }
}