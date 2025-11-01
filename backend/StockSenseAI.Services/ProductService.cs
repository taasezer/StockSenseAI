using AutoMapper;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IOpenAIService _openAIService;
    private readonly IMapper _mapper;

    public ProductService(
        IProductRepository productRepository,
        IOpenAIService openAIService,
        IMapper mapper)
    {
        _productRepository = productRepository;
        _openAIService = openAIService;
        _mapper = mapper;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        return await _productRepository.GetAllAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _productRepository.GetByIdAsync(id);
    }

    public async Task<Product> CreateAsync(ProductDto productDto)
    {
        var product = _mapper.Map<Product>(productDto);
        return await _productRepository.CreateAsync(product);
    }

    public async Task<Product?> UpdateAsync(int id, ProductDto productDto)
    {
        var existingProduct = await _productRepository.GetByIdAsync(id);
        if (existingProduct == null) return null;

        _mapper.Map(productDto, existingProduct);
        return await _productRepository.UpdateAsync(existingProduct);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _productRepository.DeleteAsync(id);
    }

    public async Task<SalesPredictionDto?> PredictNextMonthSalesAsync(int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) return null;

        var prediction = await _openAIService.PredictNextMonthSales(product.SalesHistories.ToList());
        return new SalesPredictionDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            PredictedSales = prediction
        };
    }

    public async Task<Product?> GenerateDescriptionAsync(int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) return null;

        product.Description = await _openAIService.GenerateProductDescription(product.Name, product.Category);
        await _productRepository.UpdateAsync(product);
        return product;
    }
}
