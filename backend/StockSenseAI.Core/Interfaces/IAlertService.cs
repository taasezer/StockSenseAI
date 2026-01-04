using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;

namespace StockSenseAI.Core.Interfaces;

public interface IAlertService
{
    Task<AlertSummaryDto> GetAlertSummaryAsync();
    Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync();
    Task<IEnumerable<StockAlertDto>> GetActiveAlertsAsync();
    Task<AlertSettingsDto?> GetAlertSettingsAsync(int userId);
    Task<AlertSettingsDto> UpdateAlertSettingsAsync(int userId, AlertSettingsDto settings);
    Task CheckAndCreateAlertsAsync();
    Task MarkAlertAsReadAsync(int alertId);
    Task ResolveAlertAsync(int alertId);
}
