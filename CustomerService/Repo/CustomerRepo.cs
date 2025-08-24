using CustomerService.DBContext;
using CustomerService.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerService.Repo
{
    public class CustomerRepo : ICustomerRepo
    {
        private readonly CustomerDBContext _dBContext;
        private readonly IConfiguration _configuration;

        public CustomerRepo(CustomerDBContext dBContext, IConfiguration configuration)
        {
            _dBContext = dBContext;
            _configuration = configuration;
        }


        public async Task<Customer> GetCustomer(int id)
        {
            var customer = await _dBContext.Customers.FindAsync(id);
            if(customer == null)
            {
                return null;
            }
            return customer;
        }

        public async Task<Customer> CreateCustomer(Customer customers)
        {
            var customer = await _dBContext.Customers.AddAsync(customers);
            try
            {
                await _dBContext.SaveChangesAsync();
                return customers;
            }
            catch
            {
                return null;
            }

        }

        public async Task<Customer> UpdateCustomer(int id, Customer customer)
        {
            Customer existingCustomer = await GetCustomer(id);
            if (existingCustomer == null)
            {
                return null;
            }
            /*if(existingCustomer.CustomerStatus == CustomerStatus.Activate)
            {

            }*/
            existingCustomer.CustomerName = customer.CustomerName;
            existingCustomer.CustomerEmail = customer.CustomerEmail;
            existingCustomer.CustomerMobile = customer.CustomerMobile;
            existingCustomer.CustomerAddress = customer.CustomerAddress;
            //existingCustomer.CustomerStatus = customer.CustomerStatus;

            try
            {
                await _dBContext.SaveChangesAsync();
                return existingCustomer;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> DeleteCustomer(int id)
        {
            var customer = await GetCustomer(id);
            if (customer != null)
            {
                _dBContext.Customers.Remove(customer);
                await _dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<Customer>> GetAllCustomers()
        {
            return await _dBContext.Customers.ToListAsync();
        }
    }
}
