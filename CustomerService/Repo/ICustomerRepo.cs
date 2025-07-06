using CustomerService.Models;

namespace CustomerService.Repo
{
    public interface ICustomerRepo
    {
        Task<Customer> GetCustomer(int id);
        Task<Customer> CreateCustomer(Customer customer);

        Task<Customer> UpdateCustomer(int id, Customer customer);

        Task<bool> DeleteCustomer(int id);
    }
}
