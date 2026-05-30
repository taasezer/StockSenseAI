using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StockSenseAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShipmentLocationsAndNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1);


            migrationBuilder.AddColumn<string>(
                name: "DestinationAddress",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DestinationCity",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DestinationCountryCode",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DestinationRegionCode",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginLocation",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");


            migrationBuilder.DropColumn(
                name: "DestinationAddress",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "DestinationCity",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "DestinationCountryCode",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "DestinationRegionCode",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "OriginLocation",
                table: "Shipments");

            migrationBuilder.InsertData(
                table: "Suppliers",
                columns: new[] { "Id", "Address", "AverageLeadTimeDays", "ContactEmail", "ContactPhone", "CreatedAt", "IsActive", "Name", "SupplierCode" },
                values: new object[] { 1, null, 5, "orders@techsupply.com", "+90 555 123 4567", new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1729), true, "TechSupply Co.", "SUP-1001" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "PasswordHash", "Role", "SupplierId", "Username" },
                values: new object[,]
                {
                    { 1, "$2a$11$N9qo8uLOickgx2ZMRZo5e.PY/f7u8o7F3N0YQzGpJ4o4n8iQ4nFZm", "Admin", null, "admin" },
                    { 2, "$2a$11$hD4C2oSP5y9X1R4zvYbI3OMHqV5YDhx8h8M5sL.8OznYhpRqwrhG2", "User", null, "user" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "LeadTimeDays", "Name", "Price", "ReorderLevel", "Sku", "StockCount", "SupplierId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Electronics", new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1743), "High-quality wireless headphones with noise cancellation.", 5, "Wireless Headphones", 99.99m, 15, "WH-001", 50, 1, null },
                    { 2, "Electronics", new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1749), "Fitness tracking and smart notifications on your wrist.", 7, "Smart Watch", 199.99m, 10, "SW-001", 8, 1, null },
                    { 3, "Accessories", new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1751), "7-in-1 USB-C hub with HDMI, USB-A, and SD card slots.", 3, "USB-C Hub", 49.99m, 20, "USB-001", 0, 1, null }
                });
        }
    }
}
