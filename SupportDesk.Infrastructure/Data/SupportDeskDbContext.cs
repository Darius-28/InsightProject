using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities;

namespace SupportDesk.Infrastructure.Data
{
    public class SupportDeskDbContext : DbContext
    {
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Category> Categories { get; set; }

        public SupportDeskDbContext(DbContextOptions<SupportDeskDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticket>()
                .HasMany(t => t.Attachments)
                .WithOne(a => a.Ticket)
                .HasForeignKey(a => a.TicketId);

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Category)
                .HasMaxLength(100); // Adjust the max length as needed
        }
    }
}
