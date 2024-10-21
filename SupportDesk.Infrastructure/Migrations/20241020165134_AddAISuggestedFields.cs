using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SupportDesk.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAISuggestedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AISuggestedPriority",
                table: "Tickets",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AISuggestedSteps",
                table: "Tickets",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AISuggestedTitle",
                table: "Tickets",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AISuggestedPriority",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AISuggestedSteps",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AISuggestedTitle",
                table: "Tickets");
        }
    }
}
