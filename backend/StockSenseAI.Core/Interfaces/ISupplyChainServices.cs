using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface ISupplierService
{
    Task<IEnumerable<SupplierResponseDto>> GetAllAsync();
    Task<SupplierResponseDto?> GetByIdAsync(int id);
    Task<SupplierResponseDto> CreateAsync(SupplierDto dto);
    Task<SupplierResponseDto?> UpdateAsync(int id, SupplierDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<ShipmentResponseDto>> GetSupplierShipmentsAsync(int supplierId);
}

public interface IShipmentService
{
    Task<IEnumerable<ShipmentResponseDto>> GetAllAsync();
    Task<IEnumerable<ShipmentResponseDto>> GetPendingAsync();
    Task<ShipmentResponseDto?> GetByIdAsync(int id);
    Task<ShipmentResponseDto> CreateAsync(ShipmentDto dto);
    Task<ShipmentResponseDto?> UpdateStatusAsync(int id, string status);
    Task<ShipmentResponseDto?> MarkAsDeliveredAsync(int id);
    Task<bool> CancelAsync(int id);
}
