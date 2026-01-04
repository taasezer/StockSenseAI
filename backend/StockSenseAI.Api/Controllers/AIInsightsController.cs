using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/ai-insights")]
public class AIInsightsController : ControllerBase
{
    private readonly IAIInsightsService _aiService;

    public AIInsightsController(IAIInsightsService aiService)
    {
        _aiService = aiService;
    }

    /// <summary>
    /// Get full AI insights including price optimizations, anomalies, and trends
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetFullInsights()
    {
        var insights = await _aiService.GetFullInsightsAsync();
        return Ok(insights);
    }

    /// <summary>
    /// Get price optimization for a specific product
    /// </summary>
    [HttpGet("price-optimization/{productId}")]
    public async Task<IActionResult> GetPriceOptimization(int productId)
    {
        var optimization = await _aiService.GetPriceOptimizationAsync(productId);
        return Ok(optimization);
    }

    /// <summary>
    /// Get all price optimization suggestions
    /// </summary>
    [HttpGet("price-optimizations")]
    public async Task<IActionResult> GetAllPriceOptimizations()
    {
        var optimizations = await _aiService.GetAllPriceOptimizationsAsync();
        return Ok(optimizations);
    }

    /// <summary>
    /// Get trend analysis for a specific product
    /// </summary>
    [HttpGet("trends/{productId}")]
    public async Task<IActionResult> GetTrendAnalysis(int productId)
    {
        var trends = await _aiService.GetTrendAnalysisAsync(productId);
        return Ok(trends);
    }

    /// <summary>
    /// Detect anomalies across all products
    /// </summary>
    [HttpGet("anomalies")]
    public async Task<IActionResult> DetectAnomalies()
    {
        var anomalies = await _aiService.DetectAnomaliesAsync();
        return Ok(anomalies);
    }
}
