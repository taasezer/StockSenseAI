namespace StockSenseAI.Core.Entities;

public class WebhookConfig
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Platform { get; set; } = string.Empty; // Shopify, WooCommerce, Magento, Custom
    public string WebhookUrl { get; set; } = string.Empty;
    public string? SecretKey { get; set; }
    public bool IsActive { get; set; } = true;
    public WebhookEventType EventTypes { get; set; } = WebhookEventType.All;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastTriggeredAt { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
}

[Flags]
public enum WebhookEventType
{
    None = 0,
    OrderCreated = 1,
    OrderUpdated = 2,
    StockUpdated = 4,
    ProductCreated = 8,
    ProductUpdated = 16,
    LowStockAlert = 32,
    ShipmentUpdated = 64,
    All = OrderCreated | OrderUpdated | StockUpdated | ProductCreated | ProductUpdated | LowStockAlert | ShipmentUpdated
}

public class WebhookLog
{
    public int Id { get; set; }
    public int WebhookConfigId { get; set; }
    public WebhookConfig? WebhookConfig { get; set; }
    
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public string? Response { get; set; }
    public int? StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public int RetryCount { get; set; }
}

public class ExternalOrder
{
    public int Id { get; set; }
    public string ExternalOrderId { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Delivered, Cancelled
    
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    
    public ICollection<ExternalOrderItem> Items { get; set; } = new List<ExternalOrderItem>();
}

public class ExternalOrderItem
{
    public int Id { get; set; }
    public int ExternalOrderId { get; set; }
    public ExternalOrder? ExternalOrder { get; set; }
    
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    public string? ExternalProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
