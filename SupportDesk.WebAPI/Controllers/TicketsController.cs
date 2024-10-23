using Microsoft.AspNetCore.Mvc;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace SupportDesk.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        private readonly IAIService _aiService;
        private readonly ICategoryService _categoryService;

        public TicketsController(ITicketService ticketService, IAIService aiService, ICategoryService categoryService)
        {
            _ticketService = ticketService;
            _aiService = aiService;
            _categoryService = categoryService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromForm] TicketDto ticketDto)
        {
            try
            {
                // Ensure all required fields are present
                if (string.IsNullOrWhiteSpace(ticketDto.Title) ||
                    string.IsNullOrWhiteSpace(ticketDto.Description) ||
                    string.IsNullOrWhiteSpace(ticketDto.Priority) ||
                    string.IsNullOrWhiteSpace(ticketDto.Email) ||
                    string.IsNullOrWhiteSpace(ticketDto.StepsToReproduce))
                {
                    return BadRequest("All fields are required.");
                }

                if (Request.Form.Files.Any())
                {
                    ticketDto.Attachments = Request.Form.Files.ToList();
                }

                // Explicitly set AI-suggested fields from form data
                ticketDto.AISuggestedTitle = Request.Form["aiSuggestedTitle"];
                ticketDto.AISuggestedPriority = Request.Form["aiSuggestedPriority"];
                ticketDto.AISuggestedSteps = Request.Form["aiSuggestedSteps"];

                // Log the received data
                Console.WriteLine($"Received TicketDto: Title={ticketDto.Title}, Description={ticketDto.Description}, Priority={ticketDto.Priority}, Email={ticketDto.Email}, StepsToReproduce={ticketDto.StepsToReproduce}, AISuggestedTitle={ticketDto.AISuggestedTitle}, AISuggestedPriority={ticketDto.AISuggestedPriority}, AISuggestedSteps={ticketDto.AISuggestedSteps}");

                // Get category suggestion
                var suggestedCategory = await _aiService.SuggestCategoryAsync(ticketDto.Description);
                ticketDto.Category = suggestedCategory;

                var createdTicket = await _ticketService.CreateTicketAsync(ticketDto);

                // Log the created ticket
                Console.WriteLine($"Created Ticket: Id={createdTicket.Id}, Title={createdTicket.Title}, Description={createdTicket.Description}, Priority={createdTicket.Priority}, Email={createdTicket.Email}, StepsToReproduce={createdTicket.StepsToReproduce}, AISuggestedTitle={createdTicket.AISuggestedTitle}, AISuggestedPriority={createdTicket.AISuggestedPriority}, AISuggestedSteps={createdTicket.AISuggestedSteps}, Category={createdTicket.Category}");

                return CreatedAtAction(nameof(GetTicketById), new { id = createdTicket.Id }, createdTicket);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateTicket: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("ai/suggestions")]
        public async Task<IActionResult> GetAISuggestions([FromBody] AISuggestionRequest request)
        {
            try
            {
                var titleSuggestion = await _aiService.GenerateTitleAsync(request.Description);
                var prioritySuggestion = await _aiService.GeneratePriorityAsync(request.Description);
                var stepsSuggestion = await _aiService.GenerateStepsToReproduceAsync(request.Description);
                var categorySuggestion = await _aiService.SuggestCategoryAsync(request.Description);

                return Ok(new
                {
                    title = titleSuggestion,
                    priority = prioritySuggestion,
                    stepsToReproduce = stepsSuggestion,
                    category = categorySuggestion
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting AI suggestions: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicketById(Guid id)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _ticketService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(Guid id, [FromBody] TicketDto ticketDto)
        {
            if (id != ticketDto.Id) return BadRequest();
            await _ticketService.UpdateTicketAsync(ticketDto);
            return Ok(ticketDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(Guid id)
        {
            await _ticketService.DeleteTicketAsync(id);
            return NoContent();
        }

        [HttpPut("{id}/category")]
        public async Task<IActionResult> UpdateTicketCategory(Guid id, [FromBody] string category)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null)
                return NotFound();

            var existingCategory = await _categoryService.GetOrCreateCategoryAsync(category);
            ticket.Category = existingCategory.Name;
            await _ticketService.UpdateTicketAsync(ticket);

            return Ok(ticket);
        }

        [HttpGet("category/{categoryName}")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByCategory(string categoryName)
        {
            var tickets = await _ticketService.GetTicketsByCategoryAsync(categoryName);
            if (tickets == null || !tickets.Any())
            {
                return NotFound($"No tickets found for category: {categoryName}");
            }
            return Ok(tickets);
        }
    }

    public class AISuggestionRequest
    {
        public string Description { get; set; }
    }
}
