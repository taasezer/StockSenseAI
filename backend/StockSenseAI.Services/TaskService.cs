using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly IAIInsightsService _aiService;

    public TaskService(AppDbContext context, IAIInsightsService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task<IEnumerable<EmployeeTask>> GetAllTasksAsync(int supplierId)
    {
        return await _context.EmployeeTasks
            .Include(t => t.AssignedUser)
            .Where(t => t.SupplierId == supplierId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<EmployeeTask> AssignTaskAsync(string title, string description, int? shipmentId, int supplierId)
    {
        // Bulunan depoculardan birini rastgele veya en az görevi olana ata
        var users = await _context.Users.Where(u => u.SupplierId == supplierId).ToListAsync();
        var assignee = users.FirstOrDefault(); // Basit atama mantığı

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
