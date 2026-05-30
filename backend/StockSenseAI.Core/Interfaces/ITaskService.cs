namespace StockSenseAI.Core.Interfaces;

using StockSenseAI.Core.Entities;

public interface ITaskService
{
    Task<IEnumerable<EmployeeTask>> GetAllTasksAsync(int supplierId);
    Task<EmployeeTask> AssignTaskAsync(string title, string description, int? shipmentId, int supplierId);
    Task<bool> CompleteTaskAsync(int taskId, int supplierId);
    Task GenerateAITasksAsync(int supplierId);
}
