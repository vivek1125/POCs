using AccountService.Models;

namespace AccountService.APIServices
{
    public interface ICustomerApiClient
    {
        Task<Customer?> GetCustomerAsync(int customerId);
    }
}
