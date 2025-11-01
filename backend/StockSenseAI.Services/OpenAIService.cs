using Microsoft.Extensions.Configuration;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using System.Text.Json;

namespace StockSenseAI.Services;

public class OpenAIService : IOpenAIService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public OpenAIService(IConfiguration config)
    {
        _config = config;
        _httpClient = new HttpClient();
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

        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer", _config["OpenAI:ApiKey"]);

        var response = await _httpClient.PostAsJsonAsync(
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
                new { role = "system", content = "You are a sales prediction assistant." },
                new { role = "user", content = $"Predict next month sales based on: {historyData}" }
            },
            temperature = 0.3,
            max_tokens = 10
        };

        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer", _config["OpenAI:ApiKey"]);

        var response = await _httpClient.PostAsJsonAsync(
            "https://api.openai.com/v1/chat/completions",
            request,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>();
        return int.TryParse(result?.Choices.FirstOrDefault()?.Message.Content, out var prediction) ? prediction : 0;
    }
}
