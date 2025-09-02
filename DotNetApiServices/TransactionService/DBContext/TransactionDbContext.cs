using Microsoft.EntityFrameworkCore;
using TransactionService.Models.Entities;

namespace TransactionService.Data
{
    public class TransactionDbContext : DbContext
    {
        public TransactionDbContext(DbContextOptions<TransactionDbContext> options)
            : base(options)
        {
        }

        public DbSet<TransactionEntity> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TransactionEntity>(entity =>
            {
                entity.HasKey(e => e.TransactionId);
                entity.Property(e => e.AccountNumber).IsRequired();
                entity.Property(e => e.TransactionAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TransactionMode)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasConversion<string>();
                entity.Property(e => e.TransactionType)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasConversion<string>();
                entity.Property(e => e.TransactionOn).IsRequired();
                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasConversion<string>();
            });
        }
    }
}