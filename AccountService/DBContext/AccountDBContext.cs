using AccountService.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountService.DBContext
{
    public class AccountDBContext : DbContext
    {
        public AccountDBContext(DbContextOptions<AccountDBContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .Property(acc => acc.AccountNumber)
                .UseIdentityColumn(seed: 900123, increment: 1);

            modelBuilder.Entity<Account>()
                .Property(a => a.AccountType)
                .HasConversion<string>();
            base.OnModelCreating(modelBuilder);
        }
    }
}
