using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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