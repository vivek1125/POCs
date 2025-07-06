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
        
    }
}
