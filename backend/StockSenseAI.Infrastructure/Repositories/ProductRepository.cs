using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProductRepository(AppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        return await _context.Products
            .Where(p => p.SupplierId == _currentUserService.SupplierId)
            .Include(p => p.SalesHistories)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _context.Products
            .Where(p => p.SupplierId == _currentUserService.SupplierId)
            .Include(p => p.SalesHistories)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product> CreateAsync(Product product)
    {
        if (product.SupplierId == null || product.SupplierId == 0)
        {
            product.SupplierId = _currentUserService.SupplierId;
        }
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product?> UpdateAsync(Product product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        _context.Products.Update(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}
