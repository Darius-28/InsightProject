using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SupportDesk.Application.DTOs
{
    public class TicketDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Email { get; set; }
    }
}
