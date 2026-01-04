using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Services;

public class WarehouseService : IWarehouseService
{
    private readonly AppDbContext _context;

    public WarehouseService(AppDbContext context)
    {
        _context = context;
    }

    #region Warehouse CRUD

    public async Task<IEnumerable<WarehouseResponseDto>> GetAllWarehousesAsync()
    {
        var warehouses = await _context.Warehouses
            .Include(w => w.WarehouseStocks)
            .ToListAsync();

        return warehouses.Select(MapToResponseDto);
    }

    public async Task<WarehouseResponseDto?> GetWarehouseByIdAsync(int id)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.WarehouseStocks)
            .FirstOrDefaultAsync(w => w.Id == id);

        return warehouse == null ? null : MapToResponseDto(warehouse);
    }

    public async Task<WarehouseResponseDto> CreateWarehouseAsync(WarehouseDto dto)
    {
        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Code = dto.Code,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            ContactPhone = dto.ContactPhone,
            ManagerName = dto.ManagerName,
            IsActive = dto.IsActive,
            IsPrimary = dto.IsPrimary
        };

        // If this is primary, unset other primaries
        if (dto.IsPrimary)
        {
            var existingPrimary = await _context.Warehouses.Where(w => w.IsPrimary).ToListAsync();
            foreach (var w in existingPrimary) w.IsPrimary = false;
        }

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return MapToResponseDto(warehouse);
    }

    public async Task<WarehouseResponseDto?> UpdateWarehouseAsync(int id, WarehouseDto dto)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.WarehouseStocks)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (warehouse == null) return null;

        warehouse.Name = dto.Name;
        warehouse.Code = dto.Code;
        warehouse.Address = dto.Address;
        warehouse.City = dto.City;
        warehouse.Country = dto.Country;
        warehouse.ContactPhone = dto.ContactPhone;
        warehouse.ManagerName = dto.ManagerName;
        warehouse.IsActive = dto.IsActive;
        warehouse.UpdatedAt = DateTime.UtcNow;

        if (dto.IsPrimary && !warehouse.IsPrimary)
        {
            var existingPrimary = await _context.Warehouses.Where(w => w.IsPrimary && w.Id != id).ToListAsync();
            foreach (var w in existingPrimary) w.IsPrimary = false;
        }
        warehouse.IsPrimary = dto.IsPrimary;

        await _context.SaveChangesAsync();
        return MapToResponseDto(warehouse);
    }

    public async Task<bool> DeleteWarehouseAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return false;

        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Stock Management

    public async Task<IEnumerable<WarehouseStockResponseDto>> GetWarehouseStockAsync(int warehouseId)
    {
        var stocks = await _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Include(ws => ws.Product)
            .Where(ws => ws.WarehouseId == warehouseId)
            .ToListAsync();

        return stocks.Select(MapToStockResponseDto);
    }

    public async Task<WarehouseStockResponseDto?> AddOrUpdateStockAsync(int warehouseId, WarehouseStockDto dto)
    {
        var stock = await _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Include(ws => ws.Product)
            .FirstOrDefaultAsync(ws => ws.WarehouseId == warehouseId && ws.ProductId == dto.ProductId);

        if (stock == null)
        {
            stock = new WarehouseStock
            {
                WarehouseId = warehouseId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                ReorderLevel = dto.ReorderLevel,
                Location = dto.Location
            };
            _context.WarehouseStocks.Add(stock);
        }
        else
        {
            stock.Quantity = dto.Quantity;
            stock.ReorderLevel = dto.ReorderLevel;
            stock.Location = dto.Location;
            stock.LastUpdated = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await _context.Entry(stock).Reference(s => s.Warehouse).LoadAsync();
        await _context.Entry(stock).Reference(s => s.Product).LoadAsync();

        return MapToStockResponseDto(stock);
    }

    public async Task<IEnumerable<WarehouseStockResponseDto>> GetProductStockAcrossWarehousesAsync(int productId)
    {
        var stocks = await _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Include(ws => ws.Product)
            .Where(ws => ws.ProductId == productId)
            .ToListAsync();

        return stocks.Select(MapToStockResponseDto);
    }

    #endregion

    #region Transfers

    public async Task<IEnumerable<StockTransferResponseDto>> GetAllTransfersAsync()
    {
        var transfers = await _context.StockTransfers
            .Include(st => st.SourceWarehouse)
            .Include(st => st.DestinationWarehouse)
            .Include(st => st.Product)
            .OrderByDescending(st => st.CreatedAt)
            .ToListAsync();

        return transfers.Select(MapToTransferResponseDto);
    }

    public async Task<IEnumerable<StockTransferResponseDto>> GetPendingTransfersAsync()
    {
        var transfers = await _context.StockTransfers
            .Include(st => st.SourceWarehouse)
            .Include(st => st.DestinationWarehouse)
            .Include(st => st.Product)
            .Where(st => st.Status == TransferStatus.Pending || st.Status == TransferStatus.InTransit)
            .OrderBy(st => st.CreatedAt)
            .ToListAsync();

        return transfers.Select(MapToTransferResponseDto);
    }

    public async Task<StockTransferResponseDto> CreateTransferAsync(StockTransferDto dto)
    {
        // Verify source has enough stock
        var sourceStock = await _context.WarehouseStocks
            .FirstOrDefaultAsync(ws => ws.WarehouseId == dto.SourceWarehouseId && ws.ProductId == dto.ProductId);

        if (sourceStock == null || sourceStock.Quantity < dto.Quantity)
            throw new InvalidOperationException("Insufficient stock in source warehouse");

        var transfer = new StockTransfer
        {
            SourceWarehouseId = dto.SourceWarehouseId,
            DestinationWarehouseId = dto.DestinationWarehouseId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            Notes = dto.Notes,
            Status = TransferStatus.InTransit
        };

        // Reduce source stock
        sourceStock.Quantity -= dto.Quantity;
        sourceStock.LastUpdated = DateTime.UtcNow;

        _context.StockTransfers.Add(transfer);
        await _context.SaveChangesAsync();

        await _context.Entry(transfer).Reference(t => t.SourceWarehouse).LoadAsync();
        await _context.Entry(transfer).Reference(t => t.DestinationWarehouse).LoadAsync();
        await _context.Entry(transfer).Reference(t => t.Product).LoadAsync();

        return MapToTransferResponseDto(transfer);
    }

    public async Task<StockTransferResponseDto?> CompleteTransferAsync(int transferId)
    {
        var transfer = await _context.StockTransfers
            .Include(st => st.SourceWarehouse)
            .Include(st => st.DestinationWarehouse)
            .Include(st => st.Product)
            .FirstOrDefaultAsync(st => st.Id == transferId);

        if (transfer == null) return null;

        // Add to destination stock
        var destStock = await _context.WarehouseStocks
            .FirstOrDefaultAsync(ws => ws.WarehouseId == transfer.DestinationWarehouseId && ws.ProductId == transfer.ProductId);

        if (destStock == null)
        {
            destStock = new WarehouseStock
            {
                WarehouseId = transfer.DestinationWarehouseId,
                ProductId = transfer.ProductId,
                Quantity = transfer.Quantity
            };
            _context.WarehouseStocks.Add(destStock);
        }
        else
        {
            destStock.Quantity += transfer.Quantity;
            destStock.LastUpdated = DateTime.UtcNow;
        }

        transfer.Status = TransferStatus.Completed;
        transfer.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToTransferResponseDto(transfer);
    }

    public async Task<bool> CancelTransferAsync(int transferId)
    {
        var transfer = await _context.StockTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        // Return stock to source
        if (transfer.Status == TransferStatus.InTransit)
        {
            var sourceStock = await _context.WarehouseStocks
                .FirstOrDefaultAsync(ws => ws.WarehouseId == transfer.SourceWarehouseId && ws.ProductId == transfer.ProductId);

            if (sourceStock != null)
            {
                sourceStock.Quantity += transfer.Quantity;
                sourceStock.LastUpdated = DateTime.UtcNow;
            }
        }

        transfer.Status = TransferStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Mappers

    private static WarehouseResponseDto MapToResponseDto(Warehouse w)
    {
        return new WarehouseResponseDto
        {
            Id = w.Id,
            Name = w.Name,
            Code = w.Code,
            Address = w.Address,
            City = w.City,
            Country = w.Country,
            ContactPhone = w.ContactPhone,
            ManagerName = w.ManagerName,
            IsActive = w.IsActive,
            IsPrimary = w.IsPrimary,
            TotalProducts = w.WarehouseStocks?.Count ?? 0,
            TotalStock = w.WarehouseStocks?.Sum(s => s.Quantity) ?? 0
        };
    }

    private static WarehouseStockResponseDto MapToStockResponseDto(WarehouseStock ws)
    {
        return new WarehouseStockResponseDto
        {
            Id = ws.Id,
            WarehouseId = ws.WarehouseId,
            WarehouseName = ws.Warehouse?.Name ?? "",
            ProductId = ws.ProductId,
            ProductName = ws.Product?.Name ?? "",
            ProductSku = ws.Product?.Sku,
            Quantity = ws.Quantity,
            ReorderLevel = ws.ReorderLevel,
            Location = ws.Location,
            IsLowStock = ws.Quantity <= ws.ReorderLevel
        };
    }

    private static StockTransferResponseDto MapToTransferResponseDto(StockTransfer st)
    {
        return new StockTransferResponseDto
        {
            Id = st.Id,
            SourceWarehouseId = st.SourceWarehouseId,
            SourceWarehouseName = st.SourceWarehouse?.Name ?? "",
            DestinationWarehouseId = st.DestinationWarehouseId,
            DestinationWarehouseName = st.DestinationWarehouse?.Name ?? "",
            ProductId = st.ProductId,
            ProductName = st.Product?.Name ?? "",
            Quantity = st.Quantity,
            Status = st.Status.ToString(),
            Notes = st.Notes,
            CreatedAt = st.CreatedAt,
            CompletedAt = st.CompletedAt
        };
    }

    #endregion
}
