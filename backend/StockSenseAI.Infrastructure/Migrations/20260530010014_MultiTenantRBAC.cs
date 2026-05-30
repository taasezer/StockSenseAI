using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StockSenseAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiTenantRBAC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "Warehouses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupplierCode",
                table: "Suppliers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "EmployeeTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AssignedUserId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ShipmentId = table.Column<int>(type: "integer", nullable: true),
                    SupplierId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeTasks_Shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "Shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EmployeeTasks_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeTasks_Users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1743));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1749));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1751));

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "SupplierCode" },
                values: new object[] { new DateTime(2026, 5, 30, 1, 0, 14, 83, DateTimeKind.Utc).AddTicks(1729), "SUP-1001" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "SupplierId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "SupplierId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_SupplierId",
                table: "Warehouses",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_SupplierId",
                table: "Users",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTasks_AssignedUserId",
                table: "EmployeeTasks",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTasks_ShipmentId",
                table: "EmployeeTasks",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTasks_SupplierId",
                table: "EmployeeTasks",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Suppliers_SupplierId",
                table: "Users",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Warehouses_Suppliers_SupplierId",
                table: "Warehouses",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Suppliers_SupplierId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Warehouses_Suppliers_SupplierId",
                table: "Warehouses");

            migrationBuilder.DropTable(
                name: "EmployeeTasks");

            migrationBuilder.DropIndex(
                name: "IX_Warehouses_SupplierId",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Users_SupplierId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SupplierCode",
                table: "Suppliers");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 29, 23, 28, 2, 128, DateTimeKind.Utc).AddTicks(9668));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 29, 23, 28, 2, 128, DateTimeKind.Utc).AddTicks(9674));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 29, 23, 28, 2, 128, DateTimeKind.Utc).AddTicks(9677));

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 29, 23, 28, 2, 128, DateTimeKind.Utc).AddTicks(9655));
        }
    }
}
