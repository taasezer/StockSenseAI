namespace StockSenseAI.Core.Interfaces;

public interface INotificationService
{
    Task<bool> CreateNotificationAsync(int userId, string message);
    Task<IEnumerable<object>> GetUserNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
}
