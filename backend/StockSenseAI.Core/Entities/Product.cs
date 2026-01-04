namespace StockSenseAI.Core.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public int StockCount { get; set; }
    public int ReorderLevel { get; set; } = 10; // Default threshold for low stock alert
    public int LeadTimeDays { get; set; } = 7; // Days needed for restock
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Supplier relationship
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    
    public ICollection<SalesHistory> SalesHistories { get; set; } = new List<SalesHistory>();
    
    // Computed property for alert status
    public bool IsLowStock => StockCount <= ReorderLevel;
}

