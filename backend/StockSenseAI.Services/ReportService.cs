using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<ReportSummaryDto> GetReportSummaryAsync()
    {
        var products = await _context.Products.Include(p => p.Supplier).ToListAsync();
        var suppliers = await _context.Suppliers.CountAsync();
        var activeShipments = await _context.Shipments
            .Where(s => s.Status == ShipmentStatus.Pending || s.Status == ShipmentStatus.InTransit)
            .CountAsync();

        return new ReportSummaryDto
        {
            TotalProducts = products.Count,
            LowStockProducts = products.Count(p => p.StockCount > 0 && p.StockCount <= p.ReorderLevel),
            OutOfStockProducts = products.Count(p => p.StockCount == 0),
            TotalSuppliers = suppliers,
            ActiveShipments = activeShipments,
            TotalInventoryValue = products.Sum(p => p.Price * p.StockCount),
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<byte[]> GenerateInventoryReportPdfAsync()
    {
        var products = await _context.Products.Include(p => p.Supplier).ToListAsync();
        var reportDate = DateTime.UtcNow;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("StockSenseAI").FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
                    col.Item().Text("Inventory Report").FontSize(16).SemiBold();
                    col.Item().Text($"Generated: {reportDate:yyyy-MM-dd HH:mm} UTC").FontSize(9).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingBottom(20);
                });

                page.Content().Column(col =>
                {
                    // Summary
                    col.Item().Background(Colors.Grey.Lighten3).Padding(10).Row(row =>
                    {
                        row.RelativeItem().Text($"Total Products: {products.Count}").Bold();
                        row.RelativeItem().Text($"Low Stock: {products.Count(p => p.IsLowStock && p.StockCount > 0)}").FontColor(Colors.Orange.Darken2);
                        row.RelativeItem().Text($"Out of Stock: {products.Count(p => p.StockCount == 0)}").FontColor(Colors.Red.Darken2);
                        row.RelativeItem().Text($"Value: ${products.Sum(p => p.Price * p.StockCount):N2}").FontColor(Colors.Green.Darken2);
                    });

                    col.Item().PaddingVertical(15);

                    // Table
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(30);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1.5f);
                        });

                        // Header
                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("#").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Product").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("SKU").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Stock").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Reorder").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Price").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Blue.Darken2).Padding(5).Text("Status").FontColor(Colors.White).Bold();
                        });

                        // Rows
                        foreach (var (product, index) in products.Select((p, i) => (p, i)))
                        {
                            var bgColor = index % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                            var status = product.StockCount == 0 ? "OUT OF STOCK" : product.IsLowStock ? "LOW" : "OK";
                            var statusColor = product.StockCount == 0 ? Colors.Red.Darken2 : product.IsLowStock ? Colors.Orange.Darken2 : Colors.Green.Darken2;

                            table.Cell().Background(bgColor).Padding(5).Text((index + 1).ToString());
                            table.Cell().Background(bgColor).Padding(5).Text(product.Name);
                            table.Cell().Background(bgColor).Padding(5).Text(product.Sku ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(product.StockCount.ToString());
                            table.Cell().Background(bgColor).Padding(5).Text(product.ReorderLevel.ToString());
                            table.Cell().Background(bgColor).Padding(5).Text($"${product.Price:N2}");
                            table.Cell().Background(bgColor).Padding(5).Text(status).FontColor(statusColor).Bold();
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateLowStockReportPdfAsync()
    {
        var products = await _context.Products
            .Include(p => p.Supplier)
            .Where(p => p.StockCount <= p.ReorderLevel)
            .OrderBy(p => p.StockCount)
            .ToListAsync();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("StockSenseAI").FontSize(24).Bold().FontColor(Colors.Red.Darken2);
                    col.Item().Text("Low Stock Alert Report").FontSize(16).SemiBold();
                    col.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(9);
                    col.Item().PaddingBottom(20);
                });

                page.Content().Column(col =>
                {
                    col.Item().Background(Colors.Red.Lighten4).Padding(10).Text($"⚠️ {products.Count} products require attention").Bold().FontSize(12);
                    col.Item().PaddingVertical(15);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1.5f);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Red.Darken2).Padding(5).Text("Product").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Red.Darken2).Padding(5).Text("Stock").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Red.Darken2).Padding(5).Text("Reorder").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Red.Darken2).Padding(5).Text("Supplier").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Red.Darken2).Padding(5).Text("Order Qty").FontColor(Colors.White).Bold();
                        });

                        foreach (var (product, index) in products.Select((p, i) => (p, i)))
                        {
                            var bgColor = index % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                            var suggestedOrder = Math.Max(product.ReorderLevel * 2 - product.StockCount, 0);

                            table.Cell().Background(bgColor).Padding(5).Text(product.Name);
                            table.Cell().Background(bgColor).Padding(5).Text(product.StockCount.ToString()).FontColor(product.StockCount == 0 ? Colors.Red.Darken2 : Colors.Orange.Darken2).Bold();
                            table.Cell().Background(bgColor).Padding(5).Text(product.ReorderLevel.ToString());
                            table.Cell().Background(bgColor).Padding(5).Text(product.Supplier?.Name ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text($"+{suggestedOrder}").FontColor(Colors.Green.Darken2).Bold();
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateSupplierReportPdfAsync()
    {
        var suppliers = await _context.Suppliers.Include(s => s.Products).ToListAsync();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("StockSenseAI").FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
                    col.Item().Text("Supplier Report").FontSize(16).SemiBold();
                    col.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(9);
                    col.Item().PaddingBottom(20);
                });

                page.Content().Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2.5f);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Teal.Darken2).Padding(5).Text("Supplier").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Teal.Darken2).Padding(5).Text("Email").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Teal.Darken2).Padding(5).Text("Phone").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Teal.Darken2).Padding(5).Text("Products").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Teal.Darken2).Padding(5).Text("Lead Time").FontColor(Colors.White).Bold();
                        });

                        foreach (var (supplier, index) in suppliers.Select((s, i) => (s, i)))
                        {
                            var bgColor = index % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                            table.Cell().Background(bgColor).Padding(5).Text(supplier.Name);
                            table.Cell().Background(bgColor).Padding(5).Text(supplier.ContactEmail ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(supplier.ContactPhone ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(supplier.Products.Count.ToString());
                            table.Cell().Background(bgColor).Padding(5).Text($"{supplier.AverageLeadTimeDays} days");
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateShipmentReportPdfAsync()
    {
        var shipments = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Column(col =>
                {
                    col.Item().Text("StockSenseAI").FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
                    col.Item().Text("Shipment Tracking Report").FontSize(16).SemiBold();
                    col.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(9);
                    col.Item().PaddingBottom(15);
                });

                page.Content().Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1.5f);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Product").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Supplier").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Qty").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Expected").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Actual").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Status").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.Purple.Darken2).Padding(5).Text("Tracking").FontColor(Colors.White).Bold();
                        });

                        foreach (var (shipment, index) in shipments.Select((s, i) => (s, i)))
                        {
                            var bgColor = index % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                            var statusColor = shipment.Status switch
                            {
                                ShipmentStatus.Delivered => Colors.Green.Darken2,
                                ShipmentStatus.Cancelled => Colors.Grey.Darken1,
                                ShipmentStatus.Delayed => Colors.Red.Darken2,
                                _ => Colors.Blue.Darken2
                            };

                            table.Cell().Background(bgColor).Padding(5).Text(shipment.Product?.Name ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.Supplier?.Name ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.Quantity.ToString());
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.ExpectedArrival.ToString("yyyy-MM-dd"));
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.ActualArrival?.ToString("yyyy-MM-dd") ?? "-");
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.Status.ToString()).FontColor(statusColor).Bold();
                            table.Cell().Background(bgColor).Padding(5).Text(shipment.TrackingNumber ?? "-");
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }
}
