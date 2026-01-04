using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface IWarehouseService
{
    // Warehouse CRUD
    Task<IEnumerable<WarehouseResponseDto>> GetAllWarehousesAsync();
    Task<WarehouseResponseDto?> GetWarehouseByIdAsync(int id);
    Task<WarehouseResponseDto> CreateWarehouseAsync(WarehouseDto dto);
    Task<WarehouseResponseDto?> UpdateWarehouseAsync(int id, WarehouseDto dto);
    Task<bool> DeleteWarehouseAsync(int id);
    
    // Stock management
    Task<IEnumerable<WarehouseStockResponseDto>> GetWarehouseStockAsync(int warehouseId);
    Task<WarehouseStockResponseDto?> AddOrUpdateStockAsync(int warehouseId, WarehouseStockDto dto);
    Task<IEnumerable<WarehouseStockResponseDto>> GetProductStockAcrossWarehousesAsync(int productId);
    
    // Transfers
    Task<IEnumerable<StockTransferResponseDto>> GetAllTransfersAsync();
    Task<IEnumerable<StockTransferResponseDto>> GetPendingTransfersAsync();
    Task<StockTransferResponseDto> CreateTransferAsync(StockTransferDto dto);
    Task<StockTransferResponseDto?> CompleteTransferAsync(int transferId);
    Task<bool> CancelTransferAsync(int transferId);
}
