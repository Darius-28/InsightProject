using Microsoft.EntityFrameworkCore;
using SupportDesk.Core.Entities;

namespace SupportDesk.Infrastructure.Data
{
    public class SupportDeskDbContext : DbContext
    {
        public DbSet<Ticket> Tickets { get; set; }

        public SupportDeskDbContext(DbContextOptions<SupportDeskDbContext> options)
            : base(options)
        {
        }

    }
}