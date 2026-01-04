namespace StockSenseAI.Core.Entities;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; } // e.g., "WH-01"
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? ContactPhone { get; set; }
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPrimary { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public ICollection<WarehouseStock> WarehouseStocks { get; set; } = new List<WarehouseStock>();
}

public class WarehouseStock
{
    public int Id { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    public int Quantity { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public string? Location { get; set; } // e.g., "Aisle A, Shelf 3"
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class StockTransfer
{
    public int Id { get; set; }
    public int SourceWarehouseId { get; set; }
    public Warehouse? SourceWarehouse { get; set; }
    public int DestinationWarehouseId { get; set; }
    public Warehouse? DestinationWarehouse { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    public int Quantity { get; set; }
    public TransferStatus Status { get; set; } = TransferStatus.Pending;
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

public enum TransferStatus
{
    Pending,
    InTransit,
    Completed,
    Cancelled
}
