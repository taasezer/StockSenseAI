using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;
using System.Net.Http.Json;
using System.Text.Json;

namespace StockSenseAI.Services;

public class IntegrationService : IIntegrationService
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public IntegrationService(AppDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    #region Webhook Config

    public async Task<IEnumerable<WebhookConfigResponseDto>> GetAllWebhooksAsync()
    {
        var webhooks = await _context.WebhookConfigs.ToListAsync();
        return webhooks.Select(MapToWebhookResponse);
    }

    public async Task<WebhookConfigResponseDto?> GetWebhookByIdAsync(int id)
    {
        var webhook = await _context.WebhookConfigs.FindAsync(id);
        return webhook == null ? null : MapToWebhookResponse(webhook);
    }

    public async Task<WebhookConfigResponseDto> CreateWebhookAsync(WebhookConfigDto dto)
    {
        var webhook = new WebhookConfig
        {
            Name = dto.Name,
            Description = dto.Description,
            Platform = dto.Platform,
            WebhookUrl = dto.WebhookUrl,
            SecretKey = dto.SecretKey,
            IsActive = dto.IsActive,
            EventTypes = (WebhookEventType)dto.EventTypes
        };

        _context.WebhookConfigs.Add(webhook);
        await _context.SaveChangesAsync();
        return MapToWebhookResponse(webhook);
    }

    public async Task<WebhookConfigResponseDto?> UpdateWebhookAsync(int id, WebhookConfigDto dto)
    {
        var webhook = await _context.WebhookConfigs.FindAsync(id);
        if (webhook == null) return null;

        webhook.Name = dto.Name;
        webhook.Description = dto.Description;
        webhook.Platform = dto.Platform;
        webhook.WebhookUrl = dto.WebhookUrl;
        webhook.SecretKey = dto.SecretKey;
        webhook.IsActive = dto.IsActive;
        webhook.EventTypes = (WebhookEventType)dto.EventTypes;

        await _context.SaveChangesAsync();
        return MapToWebhookResponse(webhook);
    }

    public async Task<bool> DeleteWebhookAsync(int id)
    {
        var webhook = await _context.WebhookConfigs.FindAsync(id);
        if (webhook == null) return false;

        _context.WebhookConfigs.Remove(webhook);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> TestWebhookAsync(int id)
    {
        var webhook = await _context.WebhookConfigs.FindAsync(id);
        if (webhook == null) return false;

        var testPayload = new { type = "test", message = "StockSenseAI webhook test", timestamp = DateTime.UtcNow };
        return await SendWebhookAsync(webhook, "Test", testPayload);
    }

    #endregion

    #region Webhook Logs

    public async Task<IEnumerable<WebhookLogDto>> GetWebhookLogsAsync(int? webhookId = null, int limit = 50)
    {
        var query = _context.WebhookLogs.Include(l => l.WebhookConfig).AsQueryable();

        if (webhookId.HasValue)
            query = query.Where(l => l.WebhookConfigId == webhookId.Value);

        var logs = await query.OrderByDescending(l => l.SentAt).Take(limit).ToListAsync();

        return logs.Select(l => new WebhookLogDto
        {
            Id = l.Id,
            WebhookName = l.WebhookConfig?.Name ?? "Unknown",
            EventType = l.EventType,
            StatusCode = l.StatusCode,
            IsSuccess = l.IsSuccess,
            ErrorMessage = l.ErrorMessage,
            SentAt = l.SentAt
        });
    }

    #endregion

    #region Incoming Orders

    public async Task<ExternalOrderResponseDto> ProcessIncomingOrderAsync(IncomingOrderDto dto)
    {
        var order = new ExternalOrder
        {
            ExternalOrderId = dto.ExternalOrderId,
            Platform = dto.Platform,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            TotalAmount = dto.TotalAmount,
            Status = "Pending"
        };

        foreach (var item in dto.Items)
        {
            // Try to match product by SKU
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Sku == item.Sku);

            order.Items.Add(new ExternalOrderItem
            {
                ExternalProductId = item.ExternalProductId,
                ProductId = product?.Id,
                Product = product,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });

            // Auto-reduce stock if product matched
            if (product != null && product.StockCount >= item.Quantity)
            {
                product.StockCount -= item.Quantity;
            }
        }

        _context.ExternalOrders.Add(order);
        await _context.SaveChangesAsync();

        // Trigger webhook event
        await TriggerOrderEventAsync("OrderCreated", order.Id);

        return MapToOrderResponse(order);
    }

    public async Task<IEnumerable<ExternalOrderResponseDto>> GetExternalOrdersAsync(string? status = null)
    {
        var query = _context.ExternalOrders.Include(o => o.Items).AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);

        var orders = await query.OrderByDescending(o => o.ReceivedAt).ToListAsync();
        return orders.Select(MapToOrderResponse);
    }

    public async Task<ExternalOrderResponseDto?> UpdateOrderStatusAsync(int orderId, string status)
    {
        var order = await _context.ExternalOrders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return null;

        order.Status = status;
        if (status == "Processing" || status == "Shipped")
            order.ProcessedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await TriggerOrderEventAsync("OrderUpdated", order.Id);

        return MapToOrderResponse(order);
    }

    #endregion

    #region Dashboard

    public async Task<IntegrationDashboardDto> GetDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var webhooks = await _context.WebhookConfigs.ToListAsync();
        var orders = await _context.ExternalOrders.ToListAsync();
        var recentLogs = await GetWebhookLogsAsync(limit: 10);

        return new IntegrationDashboardDto
        {
            TotalWebhooks = webhooks.Count,
            ActiveWebhooks = webhooks.Count(w => w.IsActive),
            TotalOrdersReceived = orders.Count,
            PendingOrders = orders.Count(o => o.Status == "Pending"),
            ProcessedToday = orders.Count(o => o.ProcessedAt.HasValue && o.ProcessedAt.Value.Date == today),
            RecentLogs = recentLogs.ToList()
        };
    }

    #endregion

    #region Outgoing Events

    public async Task TriggerStockUpdateEventAsync(int productId, int oldStock, int newStock)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return;

        var payload = new
        {
            type = "stock_updated",
            productId,
            productName = product.Name,
            sku = product.Sku,
            oldStock,
            newStock,
            timestamp = DateTime.UtcNow
        };

        var webhooks = await _context.WebhookConfigs
            .Where(w => w.IsActive && (w.EventTypes & WebhookEventType.StockUpdated) != 0)
            .ToListAsync();

        foreach (var webhook in webhooks)
        {
            await SendWebhookAsync(webhook, "StockUpdated", payload);
        }

        // Check for low stock alert
        if (newStock <= product.ReorderLevel && oldStock > product.ReorderLevel)
        {
            await TriggerLowStockAlertAsync(product);
        }
    }

    public async Task TriggerOrderEventAsync(string eventType, int orderId)
    {
        var order = await _context.ExternalOrders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return;

        var payload = new
        {
            type = eventType.ToLower(),
            orderId = order.Id,
            externalOrderId = order.ExternalOrderId,
            platform = order.Platform,
            status = order.Status,
            totalAmount = order.TotalAmount,
            itemCount = order.Items.Count,
            timestamp = DateTime.UtcNow
        };

        var eventFlag = eventType == "OrderCreated" ? WebhookEventType.OrderCreated : WebhookEventType.OrderUpdated;
        var webhooks = await _context.WebhookConfigs
            .Where(w => w.IsActive && (w.EventTypes & eventFlag) != 0)
            .ToListAsync();

        foreach (var webhook in webhooks)
        {
            await SendWebhookAsync(webhook, eventType, payload);
        }
    }

    private async Task TriggerLowStockAlertAsync(Product product)
    {
        var payload = new
        {
            type = "low_stock_alert",
            productId = product.Id,
            productName = product.Name,
            sku = product.Sku,
            currentStock = product.StockCount,
            reorderLevel = product.ReorderLevel,
            timestamp = DateTime.UtcNow
        };

        var webhooks = await _context.WebhookConfigs
            .Where(w => w.IsActive && (w.EventTypes & WebhookEventType.LowStockAlert) != 0)
            .ToListAsync();

        foreach (var webhook in webhooks)
        {
            await SendWebhookAsync(webhook, "LowStockAlert", payload);
        }
    }

    private async Task<bool> SendWebhookAsync(WebhookConfig webhook, string eventType, object payload)
    {
        var log = new WebhookLog
        {
            WebhookConfigId = webhook.Id,
            EventType = eventType,
            Payload = JsonSerializer.Serialize(payload)
        };

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);

            if (!string.IsNullOrEmpty(webhook.SecretKey))
                client.DefaultRequestHeaders.Add("X-Webhook-Secret", webhook.SecretKey);

            var response = await client.PostAsJsonAsync(webhook.WebhookUrl, payload);
            log.StatusCode = (int)response.StatusCode;
            log.IsSuccess = response.IsSuccessStatusCode;
            log.Response = await response.Content.ReadAsStringAsync();

            webhook.LastTriggeredAt = DateTime.UtcNow;
            if (log.IsSuccess) webhook.SuccessCount++;
            else webhook.FailureCount++;
        }
        catch (Exception ex)
        {
            log.IsSuccess = false;
            log.ErrorMessage = ex.Message;
            webhook.FailureCount++;
        }

        _context.WebhookLogs.Add(log);
        await _context.SaveChangesAsync();

        return log.IsSuccess;
    }

    #endregion

    #region Mappers

    private static WebhookConfigResponseDto MapToWebhookResponse(WebhookConfig w)
    {
        var events = new List<string>();
        if ((w.EventTypes & WebhookEventType.OrderCreated) != 0) events.Add("OrderCreated");
        if ((w.EventTypes & WebhookEventType.OrderUpdated) != 0) events.Add("OrderUpdated");
        if ((w.EventTypes & WebhookEventType.StockUpdated) != 0) events.Add("StockUpdated");
        if ((w.EventTypes & WebhookEventType.ProductCreated) != 0) events.Add("ProductCreated");
        if ((w.EventTypes & WebhookEventType.ProductUpdated) != 0) events.Add("ProductUpdated");
        if ((w.EventTypes & WebhookEventType.LowStockAlert) != 0) events.Add("LowStockAlert");
        if ((w.EventTypes & WebhookEventType.ShipmentUpdated) != 0) events.Add("ShipmentUpdated");

        return new WebhookConfigResponseDto
        {
            Id = w.Id,
            Name = w.Name,
            Description = w.Description,
            Platform = w.Platform,
            WebhookUrl = w.WebhookUrl,
            IsActive = w.IsActive,
            EnabledEvents = events,
            LastTriggeredAt = w.LastTriggeredAt,
            SuccessCount = w.SuccessCount,
            FailureCount = w.FailureCount
        };
    }

    private static ExternalOrderResponseDto MapToOrderResponse(ExternalOrder o)
    {
        return new ExternalOrderResponseDto
        {
            Id = o.Id,
            ExternalOrderId = o.ExternalOrderId,
            Platform = o.Platform,
            CustomerName = o.CustomerName,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            ReceivedAt = o.ReceivedAt,
            ItemCount = o.Items.Count,
            Items = o.Items.Select(i => new OrderItemDto
            {
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                ProductMatched = i.ProductId.HasValue
            }).ToList()
        };
    }

    #endregion
}
