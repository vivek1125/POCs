using AccountService.Models;

namespace AccountService.ApiServices
{
    public interface ICustomerApiClient
    {
        Task<Customer?> GetCustomerAsync(int customerId);
    }
}
