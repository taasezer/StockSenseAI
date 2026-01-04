using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace StockSenseAI.Services;

public class AIInsightsService : IAIInsightsService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public AIInsightsService(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AIInsightsDto> GetFullInsightsAsync()
    {
        var priceOptimizations = await GetAllPriceOptimizationsAsync();
        var anomalies = await DetectAnomaliesAsync();

        return new AIInsightsDto
        {
            PriceOptimizations = priceOptimizations.ToList(),
            Anomalies = anomalies.ToList(),
            OverallSummary = GenerateOverallSummary(priceOptimizations, anomalies),
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<PriceOptimizationDto> GetPriceOptimizationAsync(int productId)
    {
        var product = await _context.Products
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return new PriceOptimizationDto { ProductId = productId, Reasoning = "Product not found" };

        // Calculate price optimization based on stock levels and market factors
        var stockRatio = (double)product.StockCount / Math.Max(product.ReorderLevel, 1);
        decimal suggestedPrice;
        string reasoning;
        string confidence;

        if (product.StockCount == 0)
        {
            // Out of stock - no price change needed until restocked
            suggestedPrice = product.Price;
            reasoning = "Product is out of stock. Maintain current price until restocked.";
            confidence = "Low";
        }
        else if (stockRatio > 3)
        {
            // Overstocked - suggest price reduction to move inventory
            var discount = Math.Min(0.15m, (decimal)(stockRatio - 2) * 0.05m);
            suggestedPrice = Math.Round(product.Price * (1 - discount), 2);
            reasoning = $"High stock levels ({product.StockCount} units, {stockRatio:F1}x reorder level). Consider a {discount * 100:F0}% price reduction to accelerate sales.";
            confidence = "High";
        }
        else if (stockRatio < 0.5)
        {
            // Low stock with high demand potential - can increase price
            var increase = 0.05m + (decimal)(0.5 - stockRatio) * 0.1m;
            suggestedPrice = Math.Round(product.Price * (1 + increase), 2);
            reasoning = $"Low stock ({product.StockCount} units) indicates high demand. Consider a {increase * 100:F0}% price increase.";
            confidence = "Medium";
        }
        else
        {
            // Normal stock levels
            suggestedPrice = product.Price;
            reasoning = "Stock levels are optimal. Current pricing is appropriate.";
            confidence = "High";
        }

        return new PriceOptimizationDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            CurrentPrice = product.Price,
            SuggestedPrice = suggestedPrice,
            PriceChange = suggestedPrice - product.Price,
            PriceChangePercent = product.Price > 0 ? Math.Round((suggestedPrice - product.Price) / product.Price * 100, 2) : 0,
            Reasoning = reasoning,
            Confidence = confidence
        };
    }

    public async Task<TrendAnalysisDto> GetTrendAnalysisAsync(int productId)
    {
        var product = await _context.Products
            .Include(p => p.SalesHistories)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return new TrendAnalysisDto { ProductId = productId };

        var salesHistory = product.SalesHistories?.OrderBy(s => s.Month).ToList() ?? new List<SalesHistory>();
        
        string trend = "Stable";
        string seasonalPattern = "No clear pattern";
        string peakSeason = "N/A";
        var forecast = new List<int>();
        string recommendation;

        if (salesHistory.Count >= 3)
        {
            var recent = salesHistory.TakeLast(3).Select(s => s.Quantity).ToList();
            if (recent[2] > recent[1] && recent[1] > recent[0])
                trend = "Rising";
            else if (recent[2] < recent[1] && recent[1] < recent[0])
                trend = "Declining";

            // Simple forecast based on average
            var avg = (int)salesHistory.Average(s => s.Quantity);
            forecast = Enumerable.Range(1, 3).Select(_ => avg + (trend == "Rising" ? 10 : trend == "Declining" ? -5 : 0)).ToList();

            // Detect seasonal patterns (simplified)
            var maxMonth = salesHistory.OrderByDescending(s => s.Quantity).FirstOrDefault();
            if (maxMonth != null)
            {
                peakSeason = GetSeasonFromMonth(maxMonth.Month);
                seasonalPattern = $"Peak sales typically occur in {peakSeason}";
            }
        }
        else
        {
            forecast = new List<int> { product.StockCount / 3, product.StockCount / 3, product.StockCount / 3 };
        }

        recommendation = trend switch
        {
            "Rising" => "Consider increasing stock levels to meet growing demand.",
            "Declining" => "Review pricing strategy and marketing efforts. Consider promotions.",
            _ => "Maintain current inventory and pricing strategy."
        };

        return new TrendAnalysisDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Trend = trend,
            SeasonalPattern = seasonalPattern,
            PeakSeason = peakSeason,
            Recommendation = recommendation,
            MonthlyForecast = forecast
        };
    }

    public async Task<IEnumerable<AnomalyDto>> DetectAnomaliesAsync()
    {
        var anomalies = new List<AnomalyDto>();
        var products = await _context.Products.Include(p => p.Supplier).ToListAsync();

        foreach (var product in products)
        {
            // Stock anomaly: Out of stock
            if (product.StockCount == 0)
            {
                anomalies.Add(new AnomalyDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    AnomalyType = "StockAnomaly",
                    Severity = "Critical",
                    Description = $"{product.Name} is completely out of stock!",
                    SuggestedAction = $"Order at least {product.ReorderLevel * 2} units immediately from {product.Supplier?.Name ?? "supplier"}."
                });
            }
            // Stock anomaly: Very low stock
            else if (product.StockCount <= product.ReorderLevel / 2 && product.StockCount > 0)
            {
                anomalies.Add(new AnomalyDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    AnomalyType = "StockAnomaly",
                    Severity = "Warning",
                    Description = $"{product.Name} is critically low at {product.StockCount} units (below 50% of reorder level).",
                    SuggestedAction = "Place an urgent restock order."
                });
            }
            // Stock anomaly: Overstocked
            else if (product.StockCount > product.ReorderLevel * 5)
            {
                anomalies.Add(new AnomalyDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    AnomalyType = "StockAnomaly",
                    Severity = "Info",
                    Description = $"{product.Name} is overstocked at {product.StockCount} units (5x reorder level).",
                    SuggestedAction = "Consider running a promotion or adjusting future order quantities."
                });
            }

            // Price anomaly: Unusually low price
            if (product.Price < 1)
            {
                anomalies.Add(new AnomalyDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    AnomalyType = "PriceAnomaly",
                    Severity = "Warning",
                    Description = $"{product.Name} has an unusually low price of ${product.Price}.",
                    SuggestedAction = "Review pricing to ensure profitability."
                });
            }
        }

        // Check for pending shipments that are delayed
        var delayedShipments = await _context.Shipments
            .Include(s => s.Product)
            .Where(s => s.Status == ShipmentStatus.Pending && s.ExpectedArrival < DateTime.UtcNow.AddDays(-1))
            .ToListAsync();

        foreach (var shipment in delayedShipments)
        {
            anomalies.Add(new AnomalyDto
            {
                ProductId = shipment.ProductId,
                ProductName = shipment.Product?.Name ?? "Unknown",
                AnomalyType = "SupplyChainAnomaly",
                Severity = "Warning",
                Description = $"Shipment of {shipment.Quantity} units is overdue (expected {shipment.ExpectedArrival:yyyy-MM-dd}).",
                SuggestedAction = "Contact supplier for status update."
            });
        }

        return anomalies.OrderBy(a => a.Severity == "Critical" ? 0 : a.Severity == "Warning" ? 1 : 2);
    }

    public async Task<IEnumerable<PriceOptimizationDto>> GetAllPriceOptimizationsAsync()
    {
        var products = await _context.Products.ToListAsync();
        var optimizations = new List<PriceOptimizationDto>();

        foreach (var product in products)
        {
            var optimization = await GetPriceOptimizationAsync(product.Id);
            if (optimization.PriceChange != 0)
            {
                optimizations.Add(optimization);
            }
        }

        return optimizations.OrderByDescending(o => Math.Abs(o.PriceChangePercent));
    }

    private static string GenerateOverallSummary(IEnumerable<PriceOptimizationDto> prices, IEnumerable<AnomalyDto> anomalies)
    {
        var criticalCount = anomalies.Count(a => a.Severity == "Critical");
        var warningCount = anomalies.Count(a => a.Severity == "Warning");
        var priceChanges = prices.Count();

        if (criticalCount > 0)
            return $"⚠️ {criticalCount} critical issue(s) require immediate attention. {warningCount} warnings and {priceChanges} price optimization suggestions.";
        if (warningCount > 0)
            return $"📊 {warningCount} warning(s) detected. {priceChanges} products have price optimization opportunities.";
        if (priceChanges > 0)
            return $"✅ No major issues. {priceChanges} price optimization suggestions available.";
        return "✅ All systems operating normally. No issues or optimizations to report.";
    }

    private static string GetSeasonFromMonth(DateTime date)
    {
        return date.Month switch
        {
            12 or 1 or 2 => "Winter",
            3 or 4 or 5 => "Spring",
            6 or 7 or 8 => "Summer",
            _ => "Fall"
        };
    }
}
