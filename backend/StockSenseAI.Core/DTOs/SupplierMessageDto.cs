namespace StockSenseAI.Core.DTOs;

public class SupplierMessageDto
{
    public int Id { get; set; }
    public int SenderSupplierId { get; set; }
    public string SenderSupplierName { get; set; } = string.Empty;
    public int ReceiverSupplierId { get; set; }
    public string ReceiverSupplierName { get; set; } = string.Empty;
    public int SenderUserId { get; set; }
    public string SenderUserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

public class SendChatMessageDto
{
    public int ReceiverSupplierId { get; set; }
    public string Content { get; set; } = string.Empty;
}
