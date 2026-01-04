namespace StockSenseAI.Core.DTOs;

public class WarehouseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? ContactPhone { get; set; }
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPrimary { get; set; } = false;
}

public class WarehouseResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? ContactPhone { get; set; }
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; }
    public bool IsPrimary { get; set; }
    public int TotalProducts { get; set; }
    public int TotalStock { get; set; }
}

public class WarehouseStockDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public string? Location { get; set; }
}

public class WarehouseStockResponseDto
{
    public int Id { get; set; }
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public int Quantity { get; set; }
    public int ReorderLevel { get; set; }
    public string? Location { get; set; }
    public bool IsLowStock { get; set; }
}

public class StockTransferDto
{
    public int SourceWarehouseId { get; set; }
    public int DestinationWarehouseId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}

public class StockTransferResponseDto
{
    public int Id { get; set; }
    public int SourceWarehouseId { get; set; }
    public string SourceWarehouseName { get; set; } = string.Empty;
    public int DestinationWarehouseId { get; set; }
    public string DestinationWarehouseName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
