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
    
    public string? TrackingNumber { get; set; } // Will be generated as Country-Region-Random
    public string? OriginLocation { get; set; }
    public string? DestinationCountryCode { get; set; } // e.g. TR
    public string? DestinationRegionCode { get; set; } // e.g. 01
    public string? DestinationCity { get; set; }
    public string? DestinationAddress { get; set; }
    public string? Notes { get; set; }
    
    // External Supplier Tracking (Sender/Receiver outside the system)
    public string? ExternalSupplierName { get; set; }
    public string? ExternalSupplierCode { get; set; }
    
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
