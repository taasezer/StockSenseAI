namespace StockSenseAI.Core.Entities;

public class StockAlert
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    public AlertType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public bool IsResolved { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

public enum AlertType
{
    LowStock,
    OutOfStock,
    ReorderSuggestion
}
