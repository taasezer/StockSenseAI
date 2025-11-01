using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<bool> CreateCreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }
}
