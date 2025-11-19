using Microsoft.Extensions.Configuration;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

namespace StockSenseAI.Services;

public class OpenAIService : IOpenAIService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public OpenAIService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> GenerateProductDescription(string productName, string category)
    {
        var request = new
        {
            model = "gpt-4o",
            messages = new[]
            {
                new { role = "system", content = "You are a helpful assistant that generates product descriptions." },
                new { role = "user", content = $"Generate a product description for {productName} in the {category} category." }
            },
            temperature = 0.7,
            max_tokens = 200
        };

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer", _config["OpenAI:ApiKey"]);

        var response = await client.PostAsJsonAsync(
            "https://api.openai.com/v1/chat/completions",
            request,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>();
        return result?.Choices.FirstOrDefault()?.Message.Content ?? "No description generated.";
    }

    public async Task<int> PredictNextMonthSales(List<SalesHistory> history)
    {
        var historyData = string.Join(", ", history.Select(h => $"{h.Month}: {h.Quantity}"));
        var request = new
        {
            model = "gpt-4o",
            messages = new[]
            {
                new { role = "system", content = "You are a sales prediction assistant. Return only a number." },
                new { role = "user", content = $"Based on this sales history: {historyData}, predict the next month's sales quantity as a single integer number only." }
            },
            temperature = 0.3,
            max_tokens = 10
        };

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer", _config["OpenAI:ApiKey"]);

        var response = await client.PostAsJsonAsync(
            "https://api.openai.com/v1/chat/completions",
            request,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>();
        var content = result?.Choices.FirstOrDefault()?.Message.Content?.Trim();
        
        return int.TryParse(content, out var prediction) ? prediction : 0;
    }
}


