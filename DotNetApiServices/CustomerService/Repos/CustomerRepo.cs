using CustomerService.DBContext;
using CustomerService.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerService.Repos
{
    public class CustomerRepo : ICustomerRepo
    {
        private readonly CustomerDbContext _context;

        public CustomerRepo(CustomerDbContext context)
        {
            _context = context;
        }

        public async Task<Customer?> GetCustomerByIdAsync(int customerId)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.CustomerId == customerId);
        }

        public async Task<Customer?> GetCustomerByMobileAsync(string customerMobile)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.CustomerMobile == customerMobile);
        }

        public async Task<List<Customer>> GetAllCustomersAsync()
        {
            return await _context.Customers.ToListAsync();
        }

        public async Task<Customer> AddCustomerAsync(Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer;
        }

        public async Task<Customer?> UpdateCustomerAsync(Customer customer)
        {
            var existingCustomer = await _context.Customers.FindAsync(customer.CustomerId);
            if (existingCustomer == null) return null;

            existingCustomer.CustomerName = customer.CustomerName;
            existingCustomer.CustomerMobile = customer.CustomerMobile;
            existingCustomer.CustomerEmail = customer.CustomerEmail;
            existingCustomer.CustomerAddress = customer.CustomerAddress;

            await _context.SaveChangesAsync();
            return existingCustomer;
        }

        public async Task<bool> DeactivateCustomerAsync(int customerId)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null) return false;

            customer.Status = "Deactivate";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateCustomerAsync(int customerId)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null) return false;

            customer.Status = "Activate";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}