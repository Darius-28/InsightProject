using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;

namespace SupportDesk.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] TicketDto ticketDto)
        {
            await _ticketService.CreateTicketAsync(ticketDto);
            return CreatedAtAction(nameof(GetTicketById), new { id = ticketDto.Id }, ticketDto);
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
            var updatedTicket = await _ticketService.UpdateTicketAsync(ticketDto);
            return Ok(updatedTicket);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(Guid id)
        {
            await _ticketService.DeleteTicketAsync(id);
            return NoContent();
        }
    }
}