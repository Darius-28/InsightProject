namespace SupportDesk.Core.Entities
{
    public class Ticket
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
        public DateTime CreatedAt { get; set; }
        public List<Attachment> Attachments { get; set; } = new List<Attachment>();
    }

    public class Attachment
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public Guid TicketId { get; set; }
        public Ticket Ticket { get; set; }
    }
}
