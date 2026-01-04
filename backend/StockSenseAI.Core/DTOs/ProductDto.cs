namespace StockSenseAI.Core.DTOs;

public class ProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public int StockCount { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public int LeadTimeDays { get; set; } = 7;
    public int? SupplierId { get; set; }
    public string? Description { get; set; }
}

