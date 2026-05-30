using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly IAIInsightsService _aiService;
    private readonly INotificationService _notificationService;

    public TaskService(AppDbContext context, IAIInsightsService aiService, INotificationService notificationService)
    {
        _context = context;
        _aiService = aiService;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<EmployeeTask>> GetAllTasksAsync(int supplierId)
    {
        return await _context.EmployeeTasks
            .Include(t => t.AssignedUser)
            .Where(t => t.SupplierId == supplierId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<EmployeeTask> AssignTaskAsync(string title, string description, int? shipmentId, int supplierId, int? assignedUserId = null)
    {
        User? assignee = null;

        if (assignedUserId.HasValue)
        {
            assignee = await _context.Users.FirstOrDefaultAsync(u => u.Id == assignedUserId.Value && u.SupplierId == supplierId);
        }
        else
        {
            // Eğer boş bırakılırsa, (AI kararı / Akıllı atama) en az görevi olan çalışanı bul
            var usersWithTaskCounts = await _context.Users
                .Where(u => u.SupplierId == supplierId && u.Role == "Staff")
                .Select(u => new
                {
                    User = u,
                    TaskCount = _context.EmployeeTasks.Count(t => t.AssignedUserId == u.Id && t.Status != "Completed")
                })
                .OrderBy(x => x.TaskCount)
                .FirstOrDefaultAsync();

            assignee = usersWithTaskCounts?.User;
        }

        var task = new EmployeeTask
        {
            Title = title,
            Description = description,
            SupplierId = supplierId,
            ShipmentId = shipmentId,
            AssignedUserId = assignee?.Id,
            Status = "Pending"
        };

        _context.EmployeeTasks.Add(task);
        await _context.SaveChangesAsync();

        if (assignee != null)
        {
            await _notificationService.CreateNotificationAsync(
                assignee.Id, 
                $"Yeni Görev Atandı: {title} ({(shipmentId.HasValue ? $"Sevkiyat #{shipmentId}" : "Genel")})"
            );
        }

        return task;
    }

    public async Task<bool> CompleteTaskAsync(int taskId, int supplierId)
    {
        var task = await _context.EmployeeTasks.FirstOrDefaultAsync(t => t.Id == taskId && t.SupplierId == supplierId);
        if (task == null) return false;

        task.Status = "Completed";
        task.CompletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task GenerateAITasksAsync(int supplierId)
    {
        // 1. Düşük stoklu ürünler için depo kontrol görevi
        var lowStockProducts = await _context.Products
            .Where(p => p.SupplierId == supplierId && p.StockCount < p.ReorderLevel)
            .ToListAsync();

        foreach(var p in lowStockProducts)
        {
            await AssignTaskAsync(
                $"Stok Kontrolü: {p.Name}", 
                $"AI Uyarısı: {p.Name} stok seviyesi ({p.StockCount}) kritik seviyenin ({p.ReorderLevel}) altında. Lütfen raftaki gerçek sayımı doğrulayın.", 
                null, 
                supplierId
            );
        }

        // 2. Bekleyen sevkiyatlar için paketleme/indirme görevi
        var pendingShipments = await _context.Shipments
            .Where(s => s.SupplierId == supplierId && s.Status == ShipmentStatus.Pending)
            .ToListAsync();

        foreach(var s in pendingShipments)
        {
            await AssignTaskAsync(
                $"Sevkiyat Hazırlığı: #{s.Id}", 
                $"AI Rotalaması: #{s.Id} numaralı sevkiyatın yükleme işlemini başlatın.", 
                s.Id, 
                supplierId
            );
        }
    }
}
