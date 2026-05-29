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

    private async Task<string> CallOpenAIJsonAsync(string systemPrompt, string userPrompt)
    {
        var apiKey = _config["OpenAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey)) return "{}";

        var request = new
        {
            model = "gpt-4o",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.3,
            response_format = new { type = "json_object" }
        };

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var response = await client.PostAsJsonAsync(
            "https://api.openai.com/v1/chat/completions",
            request,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        if (!response.IsSuccessStatusCode) return "{}";

        var json = await response.Content.ReadAsStringAsync();
        try {
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "{}";
        } catch { return "{}"; }
    }

    public async Task<PriceOptimizationDto> GetPriceOptimizationAsync(int productId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return new PriceOptimizationDto { ProductId = productId, Reasoning = "Product not found" };

        var prompt = $"Product: {product.Name}, Price: {product.Price}, Stock: {product.StockCount}, Reorder Level: {product.ReorderLevel}. Provide a JSON response with suggestedPrice (number), reasoning (string), confidence (High/Medium/Low string).";
        var jsonResponse = await CallOpenAIJsonAsync("You are a pricing optimization AI. Respond ONLY with valid JSON.", prompt);

        try
        {
            using var doc = JsonDocument.Parse(jsonResponse);
            var suggestedPrice = doc.RootElement.GetProperty("suggestedPrice").GetDecimal();
            var reasoning = doc.RootElement.GetProperty("reasoning").GetString() ?? "";
            var confidence = doc.RootElement.GetProperty("confidence").GetString() ?? "Medium";

            return new PriceOptimizationDto
            {
                ProductId = product.Id, ProductName = product.Name, CurrentPrice = product.Price,
                SuggestedPrice = suggestedPrice, PriceChange = suggestedPrice - product.Price,
                PriceChangePercent = product.Price > 0 ? Math.Round((suggestedPrice - product.Price) / product.Price * 100, 2) : 0,
                Reasoning = reasoning, Confidence = confidence
            };
        }
        catch
        {
            return new PriceOptimizationDto { ProductId = product.Id, ProductName = product.Name, CurrentPrice = product.Price, SuggestedPrice = product.Price, Reasoning = "AI Error" };
        }
    }

    public async Task<TrendAnalysisDto> GetTrendAnalysisAsync(int productId)
    {
        var product = await _context.Products.Include(p => p.SalesHistories).FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return new TrendAnalysisDto { ProductId = productId };

        var historyData = string.Join(", ", (product.SalesHistories ?? new List<SalesHistory>()).Select(s => $"{s.Month:MMM}: {s.Quantity}"));
        var prompt = $"Product: {product.Name}, Sales History: {historyData}. Provide a JSON with trend (Rising/Declining/Stable string), seasonalPattern (string), peakSeason (string), recommendation (string), monthlyForecast (array of 3 integers).";

        var jsonResponse = await CallOpenAIJsonAsync("You are a sales trend AI. Respond ONLY with valid JSON.", prompt);

        try
        {
            using var doc = JsonDocument.Parse(jsonResponse);
            var trend = doc.RootElement.GetProperty("trend").GetString() ?? "Stable";
            var pattern = doc.RootElement.GetProperty("seasonalPattern").GetString() ?? "Unknown";
            var peak = doc.RootElement.GetProperty("peakSeason").GetString() ?? "Unknown";
            var rec = doc.RootElement.GetProperty("recommendation").GetString() ?? "";
            var forecast = doc.RootElement.GetProperty("monthlyForecast").EnumerateArray().Select(x => x.GetInt32()).ToList();

            return new TrendAnalysisDto { ProductId = product.Id, ProductName = product.Name, Trend = trend, SeasonalPattern = pattern, PeakSeason = peak, Recommendation = rec, MonthlyForecast = forecast };
        }
        catch
        {
            return new TrendAnalysisDto { ProductId = product.Id, ProductName = product.Name, Trend = "Unknown", Recommendation = "AI Error", MonthlyForecast = new List<int> { 0, 0, 0 } };
        }
    }

    public async Task<IEnumerable<AnomalyDto>> DetectAnomaliesAsync()
    {
        var products = await _context.Products.ToListAsync();
        if (!products.Any()) return new List<AnomalyDto>();

        var productSummary = string.Join(" | ", products.Take(20).Select(p => $"ID:{p.Id}, {p.Name}, Stock:{p.StockCount}, Reorder:{p.ReorderLevel}, Price:{p.Price}"));
        var prompt = $"Products: {productSummary}. Find anomalies (e.g., out of stock, overstocked, weird prices). Provide JSON with an array 'anomalies' containing objects: productId (int), anomalyType (string), severity (Critical/Warning/Info), description (string), suggestedAction (string).";

        var jsonResponse = await CallOpenAIJsonAsync("You are an anomaly detection AI. Respond ONLY with valid JSON.", prompt);

        var list = new List<AnomalyDto>();
        try
        {
            using var doc = JsonDocument.Parse(jsonResponse);
            foreach (var a in doc.RootElement.GetProperty("anomalies").EnumerateArray())
            {
                list.Add(new AnomalyDto
                {
                    ProductId = a.GetProperty("productId").GetInt32(),
                    ProductName = products.FirstOrDefault(p => p.Id == a.GetProperty("productId").GetInt32())?.Name ?? "Unknown",
                    AnomalyType = a.GetProperty("anomalyType").GetString() ?? "",
                    Severity = a.GetProperty("severity").GetString() ?? "Info",
                    Description = a.GetProperty("description").GetString() ?? "",
                    SuggestedAction = a.GetProperty("suggestedAction").GetString() ?? ""
                });
            }
        }
        catch { }

        return list;
    }

    public async Task<IEnumerable<PriceOptimizationDto>> GetAllPriceOptimizationsAsync()
    {
        var products = await _context.Products.ToListAsync();
        var optimizations = new List<PriceOptimizationDto>();

        foreach (var product in products.Take(5)) // Limit to 5 to avoid OpenAI rate limits during testing
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
}
