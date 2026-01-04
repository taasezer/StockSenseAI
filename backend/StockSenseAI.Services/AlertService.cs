using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class AlertService : IAlertService
{
    private readonly AppDbContext _context;

    public AlertService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AlertSummaryDto> GetAlertSummaryAsync()
    {
        var products = await _context.Products
            .Include(p => p.Supplier)
            .ToListAsync();

        var lowStockProducts = products
            .Where(p => p.StockCount <= p.ReorderLevel)
            .Select(p => MapToLowStockDto(p))
            .OrderBy(p => p.CurrentStock)
            .ToList();

        return new AlertSummaryDto
        {
            TotalAlerts = lowStockProducts.Count,
            CriticalCount = lowStockProducts.Count(p => p.AlertLevel == "Critical"),
            LowStockCount = lowStockProducts.Count(p => p.AlertLevel == "Low"),
            WarningCount = lowStockProducts.Count(p => p.AlertLevel == "Warning"),
            TopAlerts = lowStockProducts.Take(5).ToList()
        };
    }

    public async Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Supplier)
            .Where(p => p.StockCount <= p.ReorderLevel)
            .OrderBy(p => p.StockCount)
            .ToListAsync();

        return products.Select(MapToLowStockDto);
    }

    public async Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync()
    {
        var alerts = await _context.StockAlerts
            .Include(a => a.Product)
            .Where(a => !a.IsResolved)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return alerts.Select(a => new StockAlertDto
        {
            Id = a.Id,
            ProductId = a.ProductId,
            ProductName = a.Product?.Name ?? "",
            Sku = a.Product?.Sku,
            CurrentStock = a.Product?.StockCount ?? 0,
            ReorderLevel = a.Product?.ReorderLevel ?? 0,
            AlertType = a.Type.ToString(),
            Message = a.Message,
            IsRead = a.IsRead,
            CreatedAt = a.CreatedAt
        });
    }

    public async Task<AlertSettingsDto?> GetAlertSettingsAsync(int userId)
    {
        var settings = await _context.AlertSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null) return null;

        return new AlertSettingsDto
        {
            EmailNotificationsEnabled = settings.EmailNotificationsEnabled,
            NotificationEmail = settings.NotificationEmail,
            GlobalLowStockThreshold = settings.GlobalLowStockThreshold,
            NotifyOnLowStock = settings.NotifyOnLowStock,
            NotifyOnOutOfStock = settings.NotifyOnOutOfStock
        };
    }

    public async Task<AlertSettingsDto> UpdateAlertSettingsAsync(int userId, AlertSettingsDto dto)
    {
        var settings = await _context.AlertSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new AlertSettings { UserId = userId };
            _context.AlertSettings.Add(settings);
        }

        settings.EmailNotificationsEnabled = dto.EmailNotificationsEnabled;
        settings.NotificationEmail = dto.NotificationEmail;
        settings.GlobalLowStockThreshold = dto.GlobalLowStockThreshold;
        settings.NotifyOnLowStock = dto.NotifyOnLowStock;
        settings.NotifyOnOutOfStock = dto.NotifyOnOutOfStock;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return dto;
    }

    public async Task CheckAndCreateAlertsAsync()
    {
        var products = await _context.Products.ToListAsync();

        foreach (var product in products)
        {
            if (product.StockCount == 0)
            {
                await CreateAlertIfNotExists(product, AlertType.OutOfStock, 
                    $"{product.Name} is out of stock!");
            }
            else if (product.StockCount <= product.ReorderLevel)
            {
                await CreateAlertIfNotExists(product, AlertType.LowStock,
                    $"{product.Name} is running low ({product.StockCount} remaining)");
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task MarkAlertAsReadAsync(int alertId)
    {
        var alert = await _context.StockAlerts.FindAsync(alertId);
        if (alert != null)
        {
            alert.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task ResolveAlertAsync(int alertId)
    {
        var alert = await _context.StockAlerts.FindAsync(alertId);
        if (alert != null)
        {
            alert.IsResolved = true;
            alert.ResolvedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private async Task CreateAlertIfNotExists(Product product, AlertType type, string message)
    {
        var existingAlert = await _context.StockAlerts
            .FirstOrDefaultAsync(a => a.ProductId == product.Id 
                                      && a.Type == type 
                                      && !a.IsResolved);

        if (existingAlert == null)
        {
            _context.StockAlerts.Add(new StockAlert
            {
                ProductId = product.Id,
                Type = type,
                Message = message
            });
        }
    }

    private static LowStockProductDto MapToLowStockDto(Product p)
    {
        string alertLevel;
        if (p.StockCount == 0)
            alertLevel = "Critical";
        else if (p.StockCount <= p.ReorderLevel / 2)
            alertLevel = "Low";
        else
            alertLevel = "Warning";

        return new LowStockProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Sku = p.Sku,
            Category = p.Category,
            CurrentStock = p.StockCount,
            ReorderLevel = p.ReorderLevel,
            LeadTimeDays = p.LeadTimeDays,
            SupplierName = p.Supplier?.Name,
            AlertLevel = alertLevel,
            SuggestedOrderQuantity = Math.Max(p.ReorderLevel * 2 - p.StockCount, 0)
        };
    }
}
