using AccountService.Models;
using AccountService.Models.ResponseModels;

namespace AccountService.Repo
{
    public interface IAccountRepo
    {
        Task<Account> GetAccountDetails(int accNumber);
        Task<Account> CreateAccount(Account account);

        Task<Account> UpdateAccountBalance(int accountNumber,decimal balance);

        Task<bool> DeleteAccount(int accountNumber);
        Task<CustomerAccount> GetCustomerDetails(int accountNumber);
    }
}
