using AccountService.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountService.DBContext
{
    public class AccountDbContext : DbContext
    {
        public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.AccountNumber);
                entity.Property(e => e.AccountNumber)
                      .UseIdentityColumn(seed: 900123, increment: 1);
                entity.Property(e => e.CustomerId).IsRequired();
                entity.Property(e => e.AccountBalance)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(e => e.AccountType)
                      .IsRequired()
                      .HasMaxLength(20)
                      .HasConversion<string>();
                entity.Property(e => e.AccountStatus)
                      .IsRequired()
                      .HasMaxLength(20)
                      .HasConversion<string>();
                entity.Property(e => e.CreatedOn).IsRequired();
                entity.Property(e => e.AccountUpdateOn).IsRequired();
            });
        }
    }
}