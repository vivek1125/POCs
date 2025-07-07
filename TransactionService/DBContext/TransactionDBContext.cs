using Microsoft.EntityFrameworkCore;
using TransactionService.Models;

namespace TransactionService.DBContext
{
    public class TransactionDBContext : DbContext
    {
        public TransactionDBContext(DbContextOptions<TransactionDBContext> options): base(options)
        {
            
        }

        public DbSet<Transaction> Transactions { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Transaction>()
                .Property(a => a.TransactionType)
                .HasConversion<string>();
            modelBuilder.Entity<Transaction>()
                .Property(a => a.TransactionMode)
                .HasConversion<string>();
            base.OnModelCreating(modelBuilder);
        }
    }
}
