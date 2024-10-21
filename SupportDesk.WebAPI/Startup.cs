using Microsoft.EntityFrameworkCore;
using SupportDesk.Application.Interfaces;
using SupportDesk.Application.Services;
using SupportDesk.Infrastructure.Data;

namespace SupportDesk.WebAPI
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddScoped<ITicketService, TicketService>();
            services.AddDbContext<SupportDeskDbContext>(options =>
                options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IEmailService, EmailService>();
            services.AddHttpClient<IAIService, AIService>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    builder => builder
                        .WithOrigins("http://localhost:3000") // Your React app's URL
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowReactApp");

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
