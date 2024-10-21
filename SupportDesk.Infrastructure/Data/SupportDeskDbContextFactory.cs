using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SupportDesk.Infrastructure.Data
{
    public class SupportDeskDbContextFactory : IDesignTimeDbContextFactory<SupportDeskDbContext>
    {
        public SupportDeskDbContext CreateDbContext(string[] args)
        {
            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            // Configure DbContext options
            var optionsBuilder = new DbContextOptionsBuilder<SupportDeskDbContext>();
            optionsBuilder.UseSqlite(configuration.GetConnectionString("DefaultConnection"));

            return new SupportDeskDbContext(optionsBuilder.Options);
        }
    }
}