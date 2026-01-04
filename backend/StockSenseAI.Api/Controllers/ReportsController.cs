using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Get report summary statistics
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _reportService.GetReportSummaryAsync();
        return Ok(summary);
    }

    /// <summary>
    /// Download inventory report as PDF
    /// </summary>
    [HttpGet("inventory/pdf")]
    public async Task<IActionResult> DownloadInventoryReport()
    {
        var pdf = await _reportService.GenerateInventoryReportPdfAsync();
        return File(pdf, "application/pdf", $"inventory-report-{DateTime.UtcNow:yyyy-MM-dd}.pdf");
    }

    /// <summary>
    /// Download low stock alert report as PDF
    /// </summary>
    [HttpGet("low-stock/pdf")]
    public async Task<IActionResult> DownloadLowStockReport()
    {
        var pdf = await _reportService.GenerateLowStockReportPdfAsync();
        return File(pdf, "application/pdf", $"low-stock-report-{DateTime.UtcNow:yyyy-MM-dd}.pdf");
    }

    /// <summary>
    /// Download supplier report as PDF
    /// </summary>
    [HttpGet("suppliers/pdf")]
    public async Task<IActionResult> DownloadSupplierReport()
    {
        var pdf = await _reportService.GenerateSupplierReportPdfAsync();
        return File(pdf, "application/pdf", $"supplier-report-{DateTime.UtcNow:yyyy-MM-dd}.pdf");
    }

    /// <summary>
    /// Download shipment tracking report as PDF
    /// </summary>
    [HttpGet("shipments/pdf")]
    public async Task<IActionResult> DownloadShipmentReport()
    {
        var pdf = await _reportService.GenerateShipmentReportPdfAsync();
        return File(pdf, "application/pdf", $"shipment-report-{DateTime.UtcNow:yyyy-MM-dd}.pdf");
    }
}
