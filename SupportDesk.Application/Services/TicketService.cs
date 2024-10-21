using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities; 
using SupportDesk.Infrastructure.Data; 
using Microsoft.Extensions.Configuration;

namespace SupportDesk.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly SupportDeskDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IAIService _aiService;

        public TicketService(SupportDeskDbContext context, IEmailService emailService, IConfiguration configuration, IAIService aiService)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _aiService = aiService;
        }

        // Create
        public async Task<TicketDto> CreateTicketAsync(TicketDto ticketDto)
        {
            try
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
                    Attachments = new List<Attachment>(),
                    AISuggestedTitle = ticketDto.AISuggestedTitle,
                    AISuggestedPriority = ticketDto.AISuggestedPriority,
                    AISuggestedSteps = ticketDto.AISuggestedSteps
                };

                if (ticketDto.Attachments != null && ticketDto.Attachments.Any())
                {
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
                    Directory.CreateDirectory(uploadPath);

                    foreach (var file in ticketDto.Attachments)
                    {
                        if (file.Length > 0)
                        {
                            var fileName = file.FileName; // Use the original file name
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
                throw; // Re-throw the exception to be handled by the controller
            }
        }

        private static TicketDto MapToDto(Ticket ticket)
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
            
            if (ticket == null) return null;

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
                AttachmentInfos = ticket.Attachments?.Select(a => new AttachmentDto
                {
                    FileName = a.FileName,
                    FileSize = a.FileSize
                }).ToList() ?? new List<AttachmentDto>()
            };
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
            var ticket = await _context.Tickets.FindAsync(ticketDto.Id);
            if (ticket == null) return;

            ticket.Title = ticketDto.Title;
            ticket.Description = ticketDto.Description;
            ticket.Priority = ticketDto.Priority;
            ticket.Email = ticketDto.Email;
            ticket.StepsToReproduce = ticketDto.StepsToReproduce;
            ticket.AISuggestedTitle = ticketDto.AISuggestedTitle;
            ticket.AISuggestedPriority = ticketDto.AISuggestedPriority;
            ticket.AISuggestedSteps = ticketDto.AISuggestedSteps;

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
