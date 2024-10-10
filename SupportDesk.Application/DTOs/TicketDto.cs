using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace SupportDesk.Application.DTOs
{
    public class TicketDto
    {
        public TicketDto()
        {
            AttachmentPaths = new List<string>();
            AttachmentInfos = new List<AttachmentInfo>();
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Email { get; set; }
        public string StepsToReproduce { get; set; }
        public List<IFormFile> Attachments { get; set; }
        public List<AttachmentInfo> AttachmentInfos { get; set; }
        public List<string> AttachmentPaths { get; set; } = new List<string>();
    }

    public class AttachmentInfo
    {
        public string FileName { get; set; }
        public long FileSize { get; set; }
    }
}


