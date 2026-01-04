using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using BCrypt.Net;

namespace StockSenseAI.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<SalesHistory> SalesHistories { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Shipment> Shipments { get; set; } = null!;
        public DbSet<AlertSettings> AlertSettings { get; set; } = null!;
        public DbSet<StockAlert> StockAlerts { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        public DbSet<WarehouseStock> WarehouseStocks { get; set; } = null!;
        public DbSet<StockTransfer> StockTransfers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Product-Supplier relationship
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.SetNull);

            // AlertSettings-User relationship
            modelBuilder.Entity<AlertSettings>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId);

            // StockAlert-Product relationship
            modelBuilder.Entity<StockAlert>()
                .HasOne(a => a.Product)
                .WithMany()
                .HasForeignKey(a => a.ProductId);
            
            // Shipment relationships
            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Product)
                .WithMany()
                .HasForeignKey(s => s.ProductId);

            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Supplier)
                .WithMany()
                .HasForeignKey(s => s.SupplierId);
            
            // WarehouseStock relationships
            modelBuilder.Entity<WarehouseStock>()
                .HasOne(ws => ws.Warehouse)
                .WithMany(w => w.WarehouseStocks)
                .HasForeignKey(ws => ws.WarehouseId);

            modelBuilder.Entity<WarehouseStock>()
                .HasOne(ws => ws.Product)
                .WithMany()
                .HasForeignKey(ws => ws.ProductId);

            // StockTransfer relationships
            modelBuilder.Entity<StockTransfer>()
                .HasOne(st => st.SourceWarehouse)
                .WithMany()
                .HasForeignKey(st => st.SourceWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockTransfer>()
                .HasOne(st => st.DestinationWarehouse)
                .WithMany()
                .HasForeignKey(st => st.DestinationWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockTransfer>()
                .HasOne(st => st.Product)
                .WithMany()
                .HasForeignKey(st => st.ProductId);
            
            // Ignore computed property
            modelBuilder.Entity<Product>()
                .Ignore(p => p.IsLowStock);

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
            
            // 🏭 Supplier seed data
            modelBuilder.Entity<Supplier>().HasData(
                new Supplier
                {
                    Id = 1,
                    Name = "TechSupply Co.",
                    ContactEmail = "orders@techsupply.com",
                    ContactPhone = "+90 555 123 4567",
                    AverageLeadTimeDays = 5,
                    IsActive = true
                }
            );

            // 📦 Product seed data with new fields
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Wireless Headphones",
                    Sku = "WH-001",
                    Price = 99.99m,
                    Category = "Electronics",
                    StockCount = 50,
                    ReorderLevel = 15,
                    LeadTimeDays = 5,
                    SupplierId = 1,
                    Description = "High-quality wireless headphones with noise cancellation."
                },
                new Product
                {
                    Id = 2,
                    Name = "Smart Watch",
                    Sku = "SW-001",
                    Price = 199.99m,
                    Category = "Electronics",
                    StockCount = 8, // Low stock for demo
                    ReorderLevel = 10,
                    LeadTimeDays = 7,
                    SupplierId = 1,
                    Description = "Fitness tracking and smart notifications on your wrist."
                },
                new Product
                {
                    Id = 3,
                    Name = "USB-C Hub",
                    Sku = "USB-001",
                    Price = 49.99m,
                    Category = "Accessories",
                    StockCount = 0, // Out of stock for demo
                    ReorderLevel = 20,
                    LeadTimeDays = 3,
                    SupplierId = 1,
                    Description = "7-in-1 USB-C hub with HDMI, USB-A, and SD card slots."
                }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}

