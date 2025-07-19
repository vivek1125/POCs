using TransactionService.Models;

namespace TransactionService.ApiServices
{
    public interface IAccountApiClient
    {
        Task<Account?> GetAccountDetailsAsync(int accountId);
        Task<Account?> UpdateAccountAmountAsync(int accNum, decimal amount, DateTime updatedOn);
        Task SetJwtToken(string jwtToken);
    }
}
