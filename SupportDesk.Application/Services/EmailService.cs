using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SupportDesk.Application.DTOs;
using SupportDesk.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace SupportDesk.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendTicketCreationEmailAsync(TicketDto ticket, string recipientEmail)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Support Desk", _configuration["EmailSettings:SenderEmail"]));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = $"New Ticket Created: {ticket.Title}";

            message.Body = new TextPart("plain")
            {
                Text = $"A new ticket has been created:\n\n" +
                       $"ID: {ticket.Id}\n" +
                       $"Title: {ticket.Title}\n" +
                       $"Description: {ticket.Description}\n" +
                       $"Priority: {ticket.Priority}\n" +
                       $"Email: {ticket.Email}\n"
            };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], 
                    int.Parse(_configuration["EmailSettings:Port"]), SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                Console.WriteLine("Email sent successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                throw; // Re-throw the exception to be handled by the caller
            }
        }
    }
}