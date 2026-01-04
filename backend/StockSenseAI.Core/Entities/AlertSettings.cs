namespace StockSenseAI.Core.Entities;

public class AlertSettings
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public bool EmailNotificationsEnabled { get; set; } = false;
    public string? NotificationEmail { get; set; }
    
    public int GlobalLowStockThreshold { get; set; } = 10;
    public bool NotifyOnLowStock { get; set; } = true;
    public bool NotifyOnOutOfStock { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
