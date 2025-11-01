namespace StockSenseAI.Core.Entities;

public class SalesHistory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public string Month => SaleDate.ToString("yyyy-MM");
}
