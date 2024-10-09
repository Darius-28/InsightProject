using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Application.DTOs;

namespace SupportDesk.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendTicketCreationEmailAsync(TicketDto ticket, string recipientEmail);
    }
}