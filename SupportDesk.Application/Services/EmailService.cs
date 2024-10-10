using System;
using System.Collections.Generic;
using System.IO;
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

            var builder = new BodyBuilder();
            builder.TextBody = $"A new ticket has been created:\n\n" +
                               $"ID: {ticket.Id}\n" +
                               $"Title: {ticket.Title}\n" +
                               $"Description: {ticket.Description}\n" +
                               $"Priority: {ticket.Priority}\n" +
                               $"Email: {ticket.Email}\n";

            // Check if Steps to Reproduce is provided
            if (!string.IsNullOrWhiteSpace(ticket.StepsToReproduce))
            {
                builder.TextBody += $"Steps to Reproduce: {ticket.StepsToReproduce}\n\n";
            }
            else
            {
                builder.TextBody += "Steps to Reproduce: No steps were provided.\n\n";
            }

            if (ticket.AttachmentPaths != null && ticket.AttachmentPaths.Any())
            {
                builder.TextBody += "Attachments:\n";
                foreach (var attachmentPath in ticket.AttachmentPaths)
                {
                    var fileName = Path.GetFileName(attachmentPath);
                    var attachment = builder.Attachments.Add(attachmentPath);
                    attachment.ContentId = GenerateContentId();
                    var fileInfo = new FileInfo(attachmentPath);
                    builder.TextBody += $"- {fileName} ({FormatFileSize(fileInfo.Length)})\n";
                }
            }
            else
            {
                builder.TextBody += "No attachments were included with this ticket.";
            }

            message.Body = builder.ToMessageBody();

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

        private string GenerateContentId()
        {
            return $"{Guid.NewGuid().ToString()}@supportdesk.com";
        }

        private string FormatFileSize(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB", "PB" };
            int counter = 0;
            decimal number = (decimal)bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number = number / 1024;
                counter++;
            }
            return string.Format("{0:n1}{1}", number, suffixes[counter]);
        }
    }
}