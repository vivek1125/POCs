using CustomerService.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerService.DBContext
{
    public class CustomerDBContext : DbContext
    {
        public CustomerDBContext(DbContextOptions<CustomerDBContext> options) : base(options)
        {
            
        }

        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>()
                .Property(cust => cust.CustomerId)
                .UseIdentityColumn(seed: 2101, increment: 1);
            base.OnModelCreating(modelBuilder);
        }

    }
}
