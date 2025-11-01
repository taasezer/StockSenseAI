using StockSenseAI.Core.Entities;

namespace StockSenseAI.Core.Interfaces;

public interface IOpenAIService
{
    Task<string> GenerateProductDescription(string productName, string category);
    Task<int> PredictNextMonthSales(List<SalesHistory> history);
}
