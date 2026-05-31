using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockSenseAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalSupplierTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalSupplierCode",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalSupplierName",
                table: "Shipments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalSupplierCode",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "ExternalSupplierName",
                table: "Shipments");
        }
    }
}
