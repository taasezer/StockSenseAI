namespace StockSenseAI.Core.Entities;

public class EmployeeTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
    public int? ShipmentId { get; set; }
    public Shipment? Shipment { get; set; }
    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
