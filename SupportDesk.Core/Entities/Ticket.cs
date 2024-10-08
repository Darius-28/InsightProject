using System;
using System.ComponentModel.DataAnnotations;

namespace SupportDesk.Core.Entities
{
    public class Ticket
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}