using StockSenseAI.Core.Entities;

namespace StockSenseAI.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username); // <-- DÜZELTME: '?' eklendi
        Task<bool> CreateAsync(User user);
    }
}
