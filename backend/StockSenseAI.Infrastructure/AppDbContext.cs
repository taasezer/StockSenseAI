using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using BCrypt.Net; // ✅ BCrypt.Net kütüphanesini ekledik

namespace StockSenseAI.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<SalesHistory> SalesHistories { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 🔒 Seed data – başlangıç kullanıcıları
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    PasswordHash = "$2a$11$N9qo8uLOickgx2ZMRZo5e.PY/f7u8o7F3N0YQzGpJ4o4n8iQ4nFZm",
                    Role = "Admin"
                },
                new User
                {
                    Id = 2,
                    Username = "user",
                    PasswordHash = "$2a$11$hD4C2oSP5y9X1R4zvYbI3OMHqV5YDhx8h8M5sL.8OznYhpRqwrhG2",
                    Role = "User"
                }
            );

            // 📦 Product seed data
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Wireless Headphones",
                    Price = 99.99m,
                    Category = "Electronics",
                    StockCount = 50,
                    Description = "High-quality wireless headphones with noise cancellation."
                },
                new Product
                {
                    Id = 2,
                    Name = "Smart Watch",
                    Price = 199.99m,
                    Category = "Electronics",
                    StockCount = 30,
                    Description = "Fitness tracking and smart notifications on your wrist."
                }
            );

            base.OnModelCreating(modelBuilder); // ✅ Base çağrısı ekledik
        }
    }
}
