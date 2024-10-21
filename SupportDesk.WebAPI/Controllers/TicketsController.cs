using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;

namespace SupportDesk.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        private readonly IAIService _aiService;

        public TicketsController(ITicketService ticketService, IAIService aiService)
        {
            _ticketService = ticketService;
            _aiService = aiService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromForm] TicketDto ticketDto)
        {
            try
            {
                if (Request.Form.Files.Any())
                {
                    ticketDto.Attachments = Request.Form.Files.ToList();
                }

                var createdTicket = await _ticketService.CreateTicketAsync(ticketDto);
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

                return Ok(new
                {
                    title = titleSuggestion,
                    priority = prioritySuggestion,
                    stepsToReproduce = stepsSuggestion
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
    }

    public class AISuggestionRequest
    {
        public string Description { get; set; }
    }
}
