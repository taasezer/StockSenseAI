using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface IReportService
{
    Task<byte[]> GenerateInventoryReportPdfAsync();
    Task<byte[]> GenerateLowStockReportPdfAsync();
    Task<byte[]> GenerateSupplierReportPdfAsync();
    Task<byte[]> GenerateShipmentReportPdfAsync();
    Task<ReportSummaryDto> GetReportSummaryAsync();
}
