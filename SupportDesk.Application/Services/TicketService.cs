using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities; // Assuming Ticket is defined here
using SupportDesk.Infrastructure.Data; // Assuming SupportDeskDbContext is defined here

namespace SupportDesk.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly SupportDeskDbContext _context;

        public TicketService(SupportDeskDbContext context)
        {
            _context = context;
        }

        // Create
        public async Task CreateTicketAsync(TicketDto ticketDto)
        {
            var ticket = new Ticket
            {
                Id = Guid.NewGuid(), // Generate a new Guid
                Title = ticketDto.Title,
                Description = ticketDto.Description,
                Priority = ticketDto.Priority,
                Email = ticketDto.Email,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            
            ticketDto.Id = ticket.Id; // Update the DTO with the new ID
        }

        // Read
        public async Task<TicketDto> GetTicketByIdAsync(Guid id) // Changed from int to Guid
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return null;

            return new TicketDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Email = ticket.Email
            };
        }

        public async Task<List<TicketDto>> GetAllTicketsAsync()
        {
            return await _context.Tickets
                .Select(ticket => new TicketDto
                {
                    Id = ticket.Id,
                    Title = ticket.Title,
                    Description = ticket.Description,
                    Priority = ticket.Priority,
                    Email = ticket.Email
                })
                .ToListAsync();
        }

        // Update
        public async Task<TicketDto> UpdateTicketAsync(TicketDto ticketDto)
        {
            var ticket = await _context.Tickets.FindAsync(ticketDto.Id);
            if (ticket == null) return null;

            ticket.Title = ticketDto.Title;
            ticket.Description = ticketDto.Description;
            ticket.Priority = ticketDto.Priority;
            ticket.Email = ticketDto.Email;

            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();

            return ticketDto;
        }

        // Delete
        public async Task DeleteTicketAsync(Guid id) // Changed from int to Guid
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket != null)
            {
                _context.Tickets.Remove(ticket);
                await _context.SaveChangesAsync();
            }
        }
    }
}