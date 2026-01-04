using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarcodesController : ControllerBase
{
    private readonly IBarcodeService _barcodeService;

    public BarcodesController(IBarcodeService barcodeService)
    {
        _barcodeService = barcodeService;
    }

    /// <summary>
    /// Generate a barcode for a specific product
    /// </summary>
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateBarcode([FromBody] GenerateBarcodeRequest request)
    {
        var barcode = await _barcodeService.GenerateBarcodeAsync(request);
        return Ok(barcode);
    }

    /// <summary>
    /// Generate QR code for a product (quick endpoint)
    /// </summary>
    [HttpGet("qr/{productId}")]
    public async Task<IActionResult> GenerateQR(int productId, [FromQuery] int size = 200)
    {
        var request = new GenerateBarcodeRequest
        {
            ProductId = productId,
            BarcodeType = "QR",
            Size = size
        };
        var barcode = await _barcodeService.GenerateBarcodeAsync(request);
        return Ok(barcode);
    }

    /// <summary>
    /// Lookup a product by scanning its barcode
    /// </summary>
    [HttpGet("scan")]
    public async Task<IActionResult> ScanBarcode([FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest(new { message = "Barcode data is required" });

        var result = await _barcodeService.LookupByBarcodeAsync(code);
        return Ok(result);
    }

    /// <summary>
    /// Get a complete product label with QR and barcode
    /// </summary>
    [HttpGet("label/{productId}")]
    public async Task<IActionResult> GetProductLabel(int productId)
    {
        var label = await _barcodeService.GenerateProductLabelAsync(productId);
        return label == null ? NotFound() : Ok(label);
    }

    /// <summary>
    /// Generate barcodes for multiple products
    /// </summary>
    [HttpPost("bulk")]
    public async Task<IActionResult> GenerateBulkBarcodes([FromBody] BulkBarcodeRequest request)
    {
        var barcodes = await _barcodeService.GenerateBulkBarcodesAsync(request.ProductIds, request.BarcodeType);
        return Ok(barcodes);
    }

    /// <summary>
    /// Generate a printable PDF sheet of product labels
    /// </summary>
    [HttpPost("labels/pdf")]
    public async Task<IActionResult> GenerateLabelSheet([FromBody] LabelSheetRequest request)
    {
        var pdf = await _barcodeService.GenerateLabelSheetPdfAsync(request.ProductIds);
        return File(pdf, "application/pdf", $"product-labels-{DateTime.UtcNow:yyyy-MM-dd}.pdf");
    }
}

public class BulkBarcodeRequest
{
    public List<int> ProductIds { get; set; } = new();
    public string BarcodeType { get; set; } = "QR";
}

public class LabelSheetRequest
{
    public List<int> ProductIds { get; set; } = new();
}
