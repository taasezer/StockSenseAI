using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface IAIInsightsService
{
    Task<AIInsightsDto> GetFullInsightsAsync();
    Task<PriceOptimizationDto> GetPriceOptimizationAsync(int productId);
    Task<TrendAnalysisDto> GetTrendAnalysisAsync(int productId);
    Task<IEnumerable<AnomalyDto>> DetectAnomaliesAsync();
    Task<IEnumerable<PriceOptimizationDto>> GetAllPriceOptimizationsAsync();
}
