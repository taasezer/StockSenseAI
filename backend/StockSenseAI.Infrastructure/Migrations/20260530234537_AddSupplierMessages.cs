using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StockSenseAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupplierMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SenderSupplierId = table.Column<int>(type: "integer", nullable: false),
                    ReceiverSupplierId = table.Column<int>(type: "integer", nullable: false),
                    SenderUserId = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierMessages_Suppliers_ReceiverSupplierId",
                        column: x => x.ReceiverSupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupplierMessages_Suppliers_SenderSupplierId",
                        column: x => x.SenderSupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SupplierMessages_Users_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierMessages_ReceiverSupplierId",
                table: "SupplierMessages",
                column: "ReceiverSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierMessages_SenderSupplierId",
                table: "SupplierMessages",
                column: "SenderSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierMessages_SenderUserId",
                table: "SupplierMessages",
                column: "SenderUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplierMessages");
        }
    }
}
