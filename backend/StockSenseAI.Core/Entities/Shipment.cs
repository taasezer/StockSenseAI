namespace StockSenseAI.Core.Entities;

public class Shipment
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    
    public int Quantity { get; set; }
    public DateTime ExpectedArrival { get; set; }
    public DateTime? ActualArrival { get; set; }
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Pending;
    
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum ShipmentStatus
{
    Pending,
    InTransit,
    Delivered,
    Delayed,
    Cancelled
}
