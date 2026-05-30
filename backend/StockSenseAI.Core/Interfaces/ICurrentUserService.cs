namespace StockSenseAI.Core.Interfaces;

public interface ICurrentUserService
{
    int SupplierId { get; }
    int UserId { get; }
}
