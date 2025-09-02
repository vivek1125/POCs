using AccountService.Models;
using AccountService.Models.DTOs;

namespace AccountService.Repos
{
    public interface IAccountRepo
    {
        Task<Account?> GetAccountByNumberAsync(int accountNumber);
        Task<AccountCustomerDTO?> GetAccountWithCustomerDetailsAsync(int accountNumber);
        Task<List<Account>> GetAllAccountsAsync();
        Task<Account> CreateAccountAsync(Account account);
        Task<Account?> UpdateBalanceAsync(int accountNumber, decimal newBalance, DateTime updateOn);
        Task<bool> DeactivateAccountAsync(int accountNumber);
        Task<bool> ActivateAccountAsync(int accountNumber);
    }
}