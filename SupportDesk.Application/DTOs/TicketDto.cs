using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace SupportDesk.Application.DTOs
{
    public class TicketDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Email { get; set; }
        public string StepsToReproduce { get; set; }
        public string AISuggestedTitle { get; set; }
        public string AISuggestedPriority { get; set; }
        public string AISuggestedSteps { get; set; }
        
        [JsonIgnore] // This will exclude the property from JSON serialization
        public List<IFormFile> Attachments { get; set; }
        
        [JsonPropertyName("attachments")] // This will rename the property in JSON output
        public List<AttachmentDto> AttachmentInfos { get; set; }
    }

    public class AttachmentDto
    {
        public string FileName { get; set; }
        public long FileSize { get; set; }
    }
}



