namespace StockSenseAI.Core.DTOs;

public class StockAlertDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AlertSettingsDto
{
    public bool EmailNotificationsEnabled { get; set; }
    public string? NotificationEmail { get; set; }
    public int GlobalLowStockThreshold { get; set; }
    public bool NotifyOnLowStock { get; set; }
    public bool NotifyOnOutOfStock { get; set; }
}

public class LowStockProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string Category { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public int LeadTimeDays { get; set; }
    public string? SupplierName { get; set; }
    public string AlertLevel { get; set; } = string.Empty; // "Critical", "Low", "Warning"
    public int SuggestedOrderQuantity { get; set; }
}

public class AlertSummaryDto
{
    public int TotalAlerts { get; set; }
    public int CriticalCount { get; set; } // Out of stock
    public int LowStockCount { get; set; }
    public int WarningCount { get; set; }
    public List<LowStockProductDto> TopAlerts { get; set; } = new();
}
