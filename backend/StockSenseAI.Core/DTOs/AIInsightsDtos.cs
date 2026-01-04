namespace StockSenseAI.Core.DTOs;

public class PriceOptimizationDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal SuggestedPrice { get; set; }
    public decimal PriceChange { get; set; }
    public decimal PriceChangePercent { get; set; }
    public string Reasoning { get; set; } = string.Empty;
    public string Confidence { get; set; } = string.Empty; // High, Medium, Low
}

public class TrendAnalysisDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Trend { get; set; } = string.Empty; // Rising, Stable, Declining
    public string SeasonalPattern { get; set; } = string.Empty;
    public string PeakSeason { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public List<int> MonthlyForecast { get; set; } = new();
}

public class AnomalyDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string AnomalyType { get; set; } = string.Empty; // StockAnomaly, PriceAnomaly, SalesAnomaly
    public string Severity { get; set; } = string.Empty; // Critical, Warning, Info
    public string Description { get; set; } = string.Empty;
    public string SuggestedAction { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}

public class AIInsightsDto
{
    public List<PriceOptimizationDto> PriceOptimizations { get; set; } = new();
    public List<TrendAnalysisDto> TrendAnalyses { get; set; } = new();
    public List<AnomalyDto> Anomalies { get; set; } = new();
    public string OverallSummary { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
