using Microsoft.EntityFrameworkCore;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;
using System.Drawing;
using System.Text;

namespace StockSenseAI.Services;

public class BarcodeService : IBarcodeService
{
    private readonly AppDbContext _context;

    public BarcodeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<BarcodeDto> GenerateBarcodeAsync(GenerateBarcodeRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
            return new BarcodeDto { ProductId = request.ProductId, BarcodeData = "Product not found" };

        var barcodeData = GenerateBarcodeData(product.Id, product.Sku);
        string imageBase64;

        if (request.BarcodeType.ToUpper() == "QR")
        {
            imageBase64 = GenerateQRCode(barcodeData, request.Size);
        }
        else
        {
            // For Code128/Code39, generate a simple barcode using the SKU or ID
            imageBase64 = GenerateCode128(product.Sku ?? product.Id.ToString(), request.Size);
        }

        return new BarcodeDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Sku = product.Sku,
            BarcodeType = request.BarcodeType,
            BarcodeData = barcodeData,
            ImageBase64 = imageBase64
        };
    }

    public async Task<ScanResultDto> LookupByBarcodeAsync(string barcodeData)
    {
        // Parse the barcode data - expected format: "STOCK:{ProductId}" or just SKU
        int? productId = null;

        if (barcodeData.StartsWith("STOCK:"))
        {
            var idPart = barcodeData.Replace("STOCK:", "");
            if (int.TryParse(idPart, out var id))
                productId = id;
        }

        var product = productId.HasValue
            ? await _context.Products.Include(p => p.Supplier).FirstOrDefaultAsync(p => p.Id == productId.Value)
            : await _context.Products.Include(p => p.Supplier).FirstOrDefaultAsync(p => p.Sku == barcodeData);

        if (product == null)
        {
            return new ScanResultDto
            {
                Found = false,
                Message = $"No product found for barcode: {barcodeData}"
            };
        }

        // Get warehouse location if available
        var warehouseStock = await _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Where(ws => ws.ProductId == product.Id)
            .FirstOrDefaultAsync();

        return new ScanResultDto
        {
            Found = true,
            ProductId = product.Id,
            ProductName = product.Name,
            Sku = product.Sku,
            StockCount = product.StockCount,
            Price = product.Price,
            WarehouseLocation = warehouseStock?.Location ?? warehouseStock?.Warehouse?.Name,
            Message = "Product found"
        };
    }

    public async Task<ProductLabelDto?> GenerateProductLabelAsync(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return null;

        var barcodeData = GenerateBarcodeData(product.Id, product.Sku);

        return new ProductLabelDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Sku = product.Sku,
            Price = product.Price,
            QrCodeBase64 = GenerateQRCode(barcodeData, 150),
            BarcodeBase64 = GenerateCode128(product.Sku ?? product.Id.ToString(), 150)
        };
    }

    public async Task<IEnumerable<BarcodeDto>> GenerateBulkBarcodesAsync(IEnumerable<int> productIds, string barcodeType = "QR")
    {
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        var barcodes = new List<BarcodeDto>();
        foreach (var product in products)
        {
            var barcodeData = GenerateBarcodeData(product.Id, product.Sku);
            var imageBase64 = barcodeType.ToUpper() == "QR"
                ? GenerateQRCode(barcodeData, 200)
                : GenerateCode128(product.Sku ?? product.Id.ToString(), 200);

            barcodes.Add(new BarcodeDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Sku = product.Sku,
                BarcodeType = barcodeType,
                BarcodeData = barcodeData,
                ImageBase64 = imageBase64
            });
        }

        return barcodes;
    }

    public async Task<byte[]> GenerateLabelSheetPdfAsync(IEnumerable<int> productIds)
    {
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Text("Product Labels - StockSenseAI").FontSize(14).Bold();

                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Create labels in a grid (3 per row)
                    var rows = products.Chunk(3);
                    foreach (var row in rows)
                    {
                        col.Item().Row(rowContainer =>
                        {
                            foreach (var product in row)
                            {
                                var barcodeData = GenerateBarcodeData(product.Id, product.Sku);
                                var qrBytes = Convert.FromBase64String(GenerateQRCode(barcodeData, 80));

                                rowContainer.RelativeItem().Border(1).Padding(8).Column(labelCol =>
                                {
                                    labelCol.Item().Text(product.Name).Bold().FontSize(10);
                                    labelCol.Item().Text($"SKU: {product.Sku ?? "N/A"}").FontSize(8);
                                    labelCol.Item().Text($"Price: ${product.Price:N2}").FontSize(9).Bold();
                                    labelCol.Item().AlignCenter().Width(80).Image(qrBytes);
                                    labelCol.Item().AlignCenter().Text($"ID: {product.Id}").FontSize(7);
                                });
                            }
                            // Fill empty cells if row is not complete
                            for (int i = row.Length; i < 3; i++)
                            {
                                rowContainer.RelativeItem();
                            }
                        });
                    }
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

    #region Private Helpers

    private static string GenerateBarcodeData(int productId, string? sku)
    {
        return $"STOCK:{productId}";
    }

    private static string GenerateQRCode(string data, int pixelsPerModule)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(pixelsPerModule / 20);
        return Convert.ToBase64String(qrCodeBytes);
    }

    private static string GenerateCode128(string data, int width)
    {
        // Generate a simple Code128-style barcode pattern as SVG, then return base64
        // For production, you'd use a proper barcode library
        var svg = GenerateBarcodeSvg(data, width);
        var bytes = Encoding.UTF8.GetBytes(svg);
        return Convert.ToBase64String(bytes);
    }

    private static string GenerateBarcodeSvg(string data, int width)
    {
        var height = 50;
        var sb = new StringBuilder();
        sb.Append($"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height + 20}'>");
        
        // Generate pseudo-barcode bars based on data hash
        var hash = data.GetHashCode();
        var random = new Random(hash);
        var barWidth = width / (data.Length * 4 + 10);
        var x = 5;

        // Start pattern
        for (int i = 0; i < 3; i++)
        {
            sb.Append($"<rect x='{x}' y='0' width='{barWidth}' height='{height}' fill='black'/>");
            x += barWidth * 2;
        }

        // Data bars
        foreach (var c in data)
        {
            var bars = (c + hash) % 4 + 2;
            for (int i = 0; i < bars; i++)
            {
                var w = random.Next(1, 3) * barWidth;
                sb.Append($"<rect x='{x}' y='0' width='{w}' height='{height}' fill='black'/>");
                x += w + barWidth;
            }
        }

        // End pattern
        for (int i = 0; i < 3; i++)
        {
            sb.Append($"<rect x='{x}' y='0' width='{barWidth}' height='{height}' fill='black'/>");
            x += barWidth * 2;
        }

        // Text label
        sb.Append($"<text x='{width / 2}' y='{height + 15}' text-anchor='middle' font-size='10'>{data}</text>");
        sb.Append("</svg>");

        return sb.ToString();
    }

    #endregion
}
