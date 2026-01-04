namespace StockSenseAI.Core.DTOs;

public class ReportSummaryDto
{
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public int TotalSuppliers { get; set; }
    public int ActiveShipments { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class InventoryReportItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string Category { get; set; } = string.Empty;
    public int StockCount { get; set; }
    public int ReorderLevel { get; set; }
    public decimal Price { get; set; }
    public decimal TotalValue { get; set; }
    public string StockStatus { get; set; } = string.Empty;
    public string? SupplierName { get; set; }
}
