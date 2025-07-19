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

            if (existingCustomer.CustomerStatus != "Active")
            {
                return null;
            }

            if (!string.IsNullOrEmpty(customer.CustomerName))
            {
                existingCustomer.CustomerName = customer.CustomerName;
            }
            if (!string.IsNullOrEmpty(customer.CustomerEmail))
            {
                existingCustomer.CustomerEmail = customer.CustomerEmail;
            }
            if (!string.IsNullOrEmpty(customer.CustomerMobile))
            {
                existingCustomer.CustomerMobile = customer.CustomerMobile;
            }
            if (!string.IsNullOrEmpty(customer.CustomerAddress))
            {
                existingCustomer.CustomerAddress = customer.CustomerAddress;
            }

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
                //_dBContext.Customers.Remove(customer);
                customer.CustomerStatus = "Deactive";
                await _dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<Customer> ActivateCustomer(int id)
        {
            Customer existingCustomer = await GetCustomer(id);

            if (existingCustomer == null || existingCustomer.CustomerStatus == "Active")
            {
                return null;
            }
            try
            {
                if (existingCustomer.CustomerStatus == "Deactive")
                {
                    existingCustomer.CustomerStatus = "Active";
                    await _dBContext.SaveChangesAsync();
                }
                return existingCustomer;
            }
            catch
            {
                return null;
            }
        }
    }
}
