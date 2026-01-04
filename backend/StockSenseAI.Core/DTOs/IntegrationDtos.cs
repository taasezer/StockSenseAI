namespace StockSenseAI.Core.DTOs;

public class WebhookConfigDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string WebhookUrl { get; set; } = string.Empty;
    public string? SecretKey { get; set; }
    public bool IsActive { get; set; } = true;
    public int EventTypes { get; set; } = 127; // All events
}

public class WebhookConfigResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string WebhookUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<string> EnabledEvents { get; set; } = new();
    public DateTime? LastTriggeredAt { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
}

public class WebhookLogDto
{
    public int Id { get; set; }
    public string WebhookName { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public int? StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SentAt { get; set; }
}

public class IncomingOrderDto
{
    public string ExternalOrderId { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public decimal TotalAmount { get; set; }
    public List<IncomingOrderItemDto> Items { get; set; } = new();
}

public class IncomingOrderItemDto
{
    public string? ExternalProductId { get; set; }
    public string? Sku { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class ExternalOrderResponseDto
{
    public int Id { get; set; }
    public string ExternalOrderId { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; }
    public int ItemCount { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public bool ProductMatched { get; set; }
}

public class IntegrationDashboardDto
{
    public int TotalWebhooks { get; set; }
    public int ActiveWebhooks { get; set; }
    public int TotalOrdersReceived { get; set; }
    public int PendingOrders { get; set; }
    public int ProcessedToday { get; set; }
    public List<WebhookLogDto> RecentLogs { get; set; } = new();
}
