using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class ShipmentService : IShipmentService
{
    private readonly AppDbContext _context;

    public ShipmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ShipmentResponseDto>> GetAllAsync()
    {
        var shipments = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return shipments.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ShipmentResponseDto>> GetPendingAsync()
    {
        var shipments = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .Where(s => s.Status == ShipmentStatus.Pending || s.Status == ShipmentStatus.InTransit)
            .OrderBy(s => s.ExpectedArrival)
            .ToListAsync();

        return shipments.Select(MapToResponseDto);
    }

    public async Task<ShipmentResponseDto?> GetByIdAsync(int id)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .FirstOrDefaultAsync(s => s.Id == id);

        return shipment == null ? null : MapToResponseDto(shipment);
    }

    public async Task<ShipmentResponseDto> CreateAsync(ShipmentDto dto)
    {
        var shipment = new Shipment
        {
            ProductId = dto.ProductId,
            SupplierId = dto.SupplierId,
            Quantity = dto.Quantity,
            ExpectedArrival = dto.ExpectedArrival,
            TrackingNumber = dto.TrackingNumber,
            Notes = dto.Notes,
            Status = ShipmentStatus.Pending
        };

        _context.Shipments.Add(shipment);
        await _context.SaveChangesAsync();

        // Reload with relationships
        await _context.Entry(shipment).Reference(s => s.Product).LoadAsync();
        await _context.Entry(shipment).Reference(s => s.Supplier).LoadAsync();

        return MapToResponseDto(shipment);
    }

    public async Task<ShipmentResponseDto?> UpdateStatusAsync(int id, string status)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null) return null;

        if (Enum.TryParse<ShipmentStatus>(status, true, out var newStatus))
        {
            shipment.Status = newStatus;
            shipment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return MapToResponseDto(shipment);
    }

    public async Task<ShipmentResponseDto?> MarkAsDeliveredAsync(int id)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null) return null;

        shipment.Status = ShipmentStatus.Delivered;
        shipment.ActualArrival = DateTime.UtcNow;
        shipment.UpdatedAt = DateTime.UtcNow;

        // Update product stock
        var product = await _context.Products.FindAsync(shipment.ProductId);
        if (product != null)
        {
            product.StockCount += shipment.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return MapToResponseDto(shipment);
    }

    public async Task<bool> CancelAsync(int id)
    {
        var shipment = await _context.Shipments.FindAsync(id);
        if (shipment == null) return false;

        shipment.Status = ShipmentStatus.Cancelled;
        shipment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public static ShipmentResponseDto MapToResponseDto(Shipment shipment)
    {
        return new ShipmentResponseDto
        {
            Id = shipment.Id,
            ProductId = shipment.ProductId,
            ProductName = shipment.Product?.Name ?? "",
            SupplierId = shipment.SupplierId,
            SupplierName = shipment.Supplier?.Name ?? "",
            Quantity = shipment.Quantity,
            ExpectedArrival = shipment.ExpectedArrival,
            ActualArrival = shipment.ActualArrival,
            Status = shipment.Status.ToString(),
            TrackingNumber = shipment.TrackingNumber,
            Notes = shipment.Notes,
            CreatedAt = shipment.CreatedAt
        };
    }
}
