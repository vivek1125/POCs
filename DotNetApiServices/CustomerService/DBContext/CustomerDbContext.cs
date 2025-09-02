using CustomerService.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerService.DBContext
{
    public class CustomerDbContext : DbContext
    {
        public CustomerDbContext(DbContextOptions<CustomerDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.CustomerId);
                entity.Property(e => e.CustomerId)
                      .UseIdentityColumn(seed: 2101, increment: 1);
                entity.Property(e => e.CustomerName).IsRequired();
                entity.Property(e => e.CustomerMobile).IsRequired();
                entity.Property(e => e.CustomerEmail).IsRequired();
                entity.Property(e => e.CustomerAddress).IsRequired();
                entity.Property(e => e.Status).IsRequired();
            });
        }
    }
}