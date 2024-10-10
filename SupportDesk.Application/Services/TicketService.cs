using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities; // Assuming Ticket is defined here
using SupportDesk.Infrastructure.Data; // Assuming SupportDeskDbContext is defined here
using Microsoft.Extensions.Configuration;
using System.IO;

namespace SupportDesk.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly SupportDeskDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public TicketService(SupportDeskDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        // Create
        public async Task<TicketDto> CreateTicketAsync(TicketDto ticketDto)
        {
            var ticket = new Ticket
            {
                Id = Guid.NewGuid(),
                Title = ticketDto.Title,
                Description = ticketDto.Description,
                Priority = ticketDto.Priority,
                Email = ticketDto.Email,
                CreatedAt = DateTime.UtcNow,
                StepsToReproduce = ticketDto.StepsToReproduce,
                AttachmentPaths = new List<string>()
            };

            ticketDto.AttachmentInfos = new List<AttachmentInfo>();

            if (ticketDto.Attachments != null && ticketDto.Attachments.Any())
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
                Directory.CreateDirectory(uploadPath);

                foreach (var file in ticketDto.Attachments)
                {
                    if (file.Length > 0)
                    {
                        var fileName = Path.GetRandomFileName() + Path.GetExtension(file.FileName);
                        var filePath = Path.Combine(uploadPath, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }
                        ticket.AttachmentPaths.Add(filePath);
                        ticketDto.AttachmentPaths.Add(filePath);
                        ticketDto.AttachmentInfos.Add(new AttachmentInfo 
                        { 
                            FileName = file.FileName, 
                            FileSize = file.Length 
                        });
                    }
                }
            }

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            
            ticketDto.Id = ticket.Id;

            await _emailService.SendTicketCreationEmailAsync(ticketDto, _configuration["NotificationEmail"]);

            // Clear the Attachments property as it's not needed in the response
            ticketDto.Attachments = null;

            return ticketDto;
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
                Email = ticket.Email,
                StepsToReproduce = ticket.StepsToReproduce,
                AttachmentPaths = ticket.AttachmentPaths
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
                    Email = ticket.Email,
                    StepsToReproduce = ticket.StepsToReproduce,
                    AttachmentPaths = ticket.AttachmentPaths
                })
                .ToListAsync();
        }

        // Update
        public async Task UpdateTicketAsync(TicketDto ticketDto)
        {
            var ticket = await _context.Tickets.FindAsync(ticketDto.Id);
            if (ticket == null) return;

            ticket.Title = ticketDto.Title;
            ticket.Description = ticketDto.Description;
            ticket.Priority = ticketDto.Priority;
            ticket.Email = ticketDto.Email;

            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();
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