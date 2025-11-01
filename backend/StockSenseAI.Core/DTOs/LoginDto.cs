namespace StockSenseAI.Core.DTOs;

public class LoginDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int PredictedSales { get; set; }
}
