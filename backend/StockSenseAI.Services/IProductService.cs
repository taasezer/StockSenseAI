using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;

namespace StockSenseAI.Services;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(ProductDto productDto);
    Task<Product?> UpdateAsync(int id, ProductDto productDto);
    Task<bool> DeleteAsync(int id);
    Task<SalesPredictionDto?> PredictNextMonthSalesAsync(int productId);
    Task<Product?> GenerateDescriptionAsync(int productId);
}
