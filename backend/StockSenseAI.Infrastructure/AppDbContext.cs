using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Infrastructure
{
    public class AppDbContext : DbContext
    {
        private readonly ICurrentUserService? _currentUserService;

        public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null) : base(options) 
        { 
            _currentUserService = currentUserService;
        }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<SalesHistory> SalesHistories { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Shipment> Shipments { get; set; } = null!;
        public DbSet<AlertSettings> AlertSettings { get; set; }
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<SupplierMessage> SupplierMessages { get; set; } = null!;
        public DbSet<StockAlert> StockAlerts { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        public DbSet<WarehouseStock> WarehouseStocks { get; set; } = null!;
        public DbSet<StockTransfer> StockTransfers { get; set; } = null!;
        public DbSet<WebhookConfig> WebhookConfigs { get; set; } = null!;
        public DbSet<WebhookLog> WebhookLogs { get; set; } = null!;
        public DbSet<ExternalOrder> ExternalOrders { get; set; } = null!;
        public DbSet<ExternalOrderItem> ExternalOrderItems { get; set; } = null!;
        public DbSet<EmployeeTask> EmployeeTasks { get; set; } = null!;

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
            
            // EmployeeTask relationships
            modelBuilder.Entity<EmployeeTask>()
                .HasOne(et => et.AssignedUser)
                .WithMany()
                .HasForeignKey(et => et.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EmployeeTask>()
                .HasOne(et => et.Supplier)
                .WithMany()
                .HasForeignKey(et => et.SupplierId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeeTask>()
                .HasOne(et => et.Shipment)
                .WithMany()
                .HasForeignKey(et => et.ShipmentId)
                .OnDelete(DeleteBehavior.SetNull);

            // Ignore computed property
            modelBuilder.Entity<Product>()
                .Ignore(p => p.IsLowStock);

            // SupplierMessage relationships
            modelBuilder.Entity<SupplierMessage>()
                .HasOne(m => m.SenderSupplier)
                .WithMany()
                .HasForeignKey(m => m.SenderSupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupplierMessage>()
                .HasOne(m => m.ReceiverSupplier)
                .WithMany()
                .HasForeignKey(m => m.ReceiverSupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupplierMessage>()
                .HasOne(m => m.SenderUser)
                .WithMany()
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // GLOBAL QUERY FILTERS - Data Isolation
            var supplierId = _currentUserService?.SupplierId ?? 0;
            // Apply only if supplierId > 0 (e.g. not called by background seed/admin bypass)
            if (supplierId > 0)
            {
                modelBuilder.Entity<Product>().HasQueryFilter(p => p.SupplierId == supplierId);
                modelBuilder.Entity<Warehouse>().HasQueryFilter(w => w.SupplierId == supplierId);
                modelBuilder.Entity<Shipment>().HasQueryFilter(s => s.SupplierId == supplierId);
                modelBuilder.Entity<EmployeeTask>().HasQueryFilter(e => e.SupplierId == supplierId);
            }

            base.OnModelCreating(modelBuilder);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var supplierId = _currentUserService?.SupplierId ?? 0;
            if (supplierId > 0)
            {
                foreach (var entry in ChangeTracker.Entries().Where(e => e.State == EntityState.Added))
                {
                    var property = entry.Entity.GetType().GetProperty("SupplierId");
                    if (property != null && (int)(property.GetValue(entry.Entity) ?? 0) == 0)
                    {
                        property.SetValue(entry.Entity, supplierId);
                    }
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}

