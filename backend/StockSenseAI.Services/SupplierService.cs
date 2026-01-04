using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _context;

    public SupplierService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SupplierResponseDto>> GetAllAsync()
    {
        var suppliers = await _context.Suppliers
            .Include(s => s.Products)
            .ToListAsync();

        return suppliers.Select(MapToResponseDto);
    }

    public async Task<SupplierResponseDto?> GetByIdAsync(int id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == id);

        return supplier == null ? null : MapToResponseDto(supplier);
    }

    public async Task<SupplierResponseDto> CreateAsync(SupplierDto dto)
    {
        var supplier = new Supplier
        {
            Name = dto.Name,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            AverageLeadTimeDays = dto.AverageLeadTimeDays,
            IsActive = dto.IsActive
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return MapToResponseDto(supplier);
    }

    public async Task<SupplierResponseDto?> UpdateAsync(int id, SupplierDto dto)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return null;

        supplier.Name = dto.Name;
        supplier.ContactEmail = dto.ContactEmail;
        supplier.ContactPhone = dto.ContactPhone;
        supplier.Address = dto.Address;
        supplier.AverageLeadTimeDays = dto.AverageLeadTimeDays;
        supplier.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return MapToResponseDto(supplier);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return false;

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ShipmentResponseDto>> GetSupplierShipmentsAsync(int supplierId)
    {
        var shipments = await _context.Shipments
            .Include(s => s.Product)
            .Include(s => s.Supplier)
            .Where(s => s.SupplierId == supplierId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return shipments.Select(ShipmentService.MapToResponseDto);
    }

    private static SupplierResponseDto MapToResponseDto(Supplier supplier)
    {
        return new SupplierResponseDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactEmail = supplier.ContactEmail,
            ContactPhone = supplier.ContactPhone,
            Address = supplier.Address,
            AverageLeadTimeDays = supplier.AverageLeadTimeDays,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            ProductCount = supplier.Products?.Count ?? 0
        };
    }
}
