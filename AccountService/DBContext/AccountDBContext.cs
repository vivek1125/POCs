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
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .HasIndex(u => u.AccountNumber)
                .IsUnique();

            modelBuilder.Entity<Account>()
                .Property(u => u.AccountId)
                .ValueGeneratedOnAdd()
                .HasAnnotation("SqlServer:Identity", "101, 1");

            modelBuilder.Entity<Account>()
                .HasOne(a => a.Customer)
                .WithMany()
                .HasForeignKey(a => a.CustomerId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
