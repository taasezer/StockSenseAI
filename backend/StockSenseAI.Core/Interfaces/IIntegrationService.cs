using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface IIntegrationService
{
    // Webhook Config
    Task<IEnumerable<WebhookConfigResponseDto>> GetAllWebhooksAsync();
    Task<WebhookConfigResponseDto?> GetWebhookByIdAsync(int id);
    Task<WebhookConfigResponseDto> CreateWebhookAsync(WebhookConfigDto dto);
    Task<WebhookConfigResponseDto?> UpdateWebhookAsync(int id, WebhookConfigDto dto);
    Task<bool> DeleteWebhookAsync(int id);
    Task<bool> TestWebhookAsync(int id);
    
    // Webhook Logs
    Task<IEnumerable<WebhookLogDto>> GetWebhookLogsAsync(int? webhookId = null, int limit = 50);
    
    // Incoming Orders
    Task<ExternalOrderResponseDto> ProcessIncomingOrderAsync(IncomingOrderDto dto);
    Task<IEnumerable<ExternalOrderResponseDto>> GetExternalOrdersAsync(string? status = null);
    Task<ExternalOrderResponseDto?> UpdateOrderStatusAsync(int orderId, string status);
    
    // Dashboard
    Task<IntegrationDashboardDto> GetDashboardAsync();
    
    // Outgoing Events
    Task TriggerStockUpdateEventAsync(int productId, int oldStock, int newStock);
    Task TriggerOrderEventAsync(string eventType, int orderId);
}
