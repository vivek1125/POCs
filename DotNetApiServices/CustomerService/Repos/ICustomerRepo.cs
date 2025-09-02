using CustomerService.Models;

namespace CustomerService.Repos
{
    public interface ICustomerRepo
    {
        Task<Customer?> GetCustomerByIdAsync(int customerId);
        Task<Customer?> GetCustomerByMobileAsync(string customerMobile);
        Task<List<Customer>> GetAllCustomersAsync();
        Task<Customer> AddCustomerAsync(Customer customer);
        Task<Customer?> UpdateCustomerAsync(Customer customer);
        Task<bool> DeactivateCustomerAsync(int customerId);
        Task<bool> ActivateCustomerAsync(int customerId);
    }
}