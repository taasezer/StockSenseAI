namespace StockSenseAI.Core.Entities;

public class SupplierMessage
{
    public int Id { get; set; }
    
    public int SenderSupplierId { get; set; }
    public Supplier SenderSupplier { get; set; } = null!;

    public int ReceiverSupplierId { get; set; }
    public Supplier ReceiverSupplier { get; set; } = null!;

    public int SenderUserId { get; set; }
    public User SenderUser { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
