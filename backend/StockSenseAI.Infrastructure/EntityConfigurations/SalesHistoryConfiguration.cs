using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockSenseAI.Core.Entities;

namespace StockSenseAI.Infrastructure.EntityConfigurations;

public class SalesHistoryConfiguration : IEntityTypeConfiguration<SalesHistory>
{
    public void Configure(EntityTypeBuilder<SalesHistory> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Quantity).IsRequired();
        builder.Property(s => s.SaleDate).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(s => s.Product)
            .WithMany(p => p.SalesHistories)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
