using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities; 
using SupportDesk.Infrastructure.Data; 
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SupportDesk.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly SupportDeskDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IAIService _aiService;
        private readonly ICategoryService _categoryService;

        public TicketService(SupportDeskDbContext context, IEmailService emailService, IConfiguration configuration, IAIService aiService, ICategoryService categoryService)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _aiService = aiService;
            _categoryService = categoryService;
        }

        // Create
        public async Task<TicketDto> CreateTicketAsync(TicketDto ticketDto)
        {
            try
            {
                // Ensure the category exists
                await _categoryService.GetOrCreateCategoryAsync(ticketDto.Category);

                var ticket = new Ticket
                {
                    Id = Guid.NewGuid(),
                    Title = ticketDto.Title,
                    Description = ticketDto.Description,
                    Priority = ticketDto.Priority,
                    Email = ticketDto.Email,
                    CreatedAt = DateTime.UtcNow,
                    StepsToReproduce = ticketDto.StepsToReproduce,
                    Attachments = new List<Attachment>(),
                    AISuggestedTitle = ticketDto.AISuggestedTitle,
                    AISuggestedPriority = ticketDto.AISuggestedPriority,
                    AISuggestedSteps = ticketDto.AISuggestedSteps,
                    Category = ticketDto.Category // Use the single category from DTO
                };

                if (ticketDto.Attachments != null && ticketDto.Attachments.Any())
                {
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
                    Directory.CreateDirectory(uploadPath);

                    foreach (var file in ticketDto.Attachments)
                    {
                        if (file.Length > 0)
                        {
                            var fileName = file.FileName;
                            var filePath = Path.Combine(uploadPath, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await file.CopyToAsync(stream);
                            }
                            var attachment = new Attachment
                            {
                                Id = Guid.NewGuid(),
                                FileName = fileName,
                                FilePath = filePath,
                                FileSize = file.Length,
                                TicketId = ticket.Id
                            };
                            ticket.Attachments.Add(attachment);
                        }
                    }
                }

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();
                
                var createdTicketDto = MapToDto(ticket);
                await _emailService.SendTicketCreationEmailAsync(createdTicketDto, _configuration["NotificationEmail"]);
                
                return createdTicketDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating ticket: {ex.Message}");
                throw;
            }
        }

        private TicketDto MapToDto(Ticket ticket)
        {
            return new TicketDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Email = ticket.Email,
                StepsToReproduce = ticket.StepsToReproduce,
                AISuggestedTitle = ticket.AISuggestedTitle,
                AISuggestedPriority = ticket.AISuggestedPriority,
                AISuggestedSteps = ticket.AISuggestedSteps,
                Category = ticket.Category,
                AttachmentInfos = ticket.Attachments?.Select(a => new AttachmentDto
                {
                    FileName = a.FileName,
                    FileSize = a.FileSize
                }).ToList() ?? new List<AttachmentDto>()
            };
        }

        // Read
        public async Task<TicketDto> GetTicketByIdAsync(Guid id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            return ticket == null ? null : MapToDto(ticket);
        }

        public async Task<List<TicketDto>> GetAllTicketsAsync()
        {
            var tickets = await _context.Tickets
                .Include(t => t.Attachments)
                .ToListAsync();

            return tickets.Select(MapToDto).ToList();
        }

        // Update
        public async Task UpdateTicketAsync(TicketDto ticketDto)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == ticketDto.Id);

            if (ticket == null) return;

            ticket.Title = ticketDto.Title;
            ticket.Description = ticketDto.Description;
            ticket.Priority = ticketDto.Priority;
            ticket.Email = ticketDto.Email;
            ticket.StepsToReproduce = ticketDto.StepsToReproduce;
            ticket.AISuggestedTitle = ticketDto.AISuggestedTitle;
            ticket.AISuggestedPriority = ticketDto.AISuggestedPriority;
            ticket.AISuggestedSteps = ticketDto.AISuggestedSteps;
            ticket.Category = ticketDto.Category;

            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();
        }

        // Delete
        public async Task DeleteTicketAsync(Guid id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket != null)
            {
                _context.Tickets.Remove(ticket);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<TicketDto>> GetTicketsByCategoryAsync(string categoryName)
        {
            var tickets = await _context.Tickets
                .Where(t => t.Category == categoryName)
                .ToListAsync();

            return tickets.Select(MapToDto).ToList();
        }
    }
}
