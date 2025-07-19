using AccountService.Models;
using AccountService.Models.RequestModels;
using AccountService.Models.ResponseModels;

namespace AccountService.Repo
{
    public interface IAccountRepo
    {
        Task<Account> GetAccountDetails(int accNumber);
        Task<AccountRes> CreateAccount(AccountReq account, string jwtToken);

        Task<Account> UpdateAccountBalance(int accountNumber,decimal balance, DateTime updatedOn,string jwtToken);

        Task<bool> DeleteAccount(int accountNumber);
        Task<AccountCustomerDTOs> GetCustomerDetails(int accountNumber, string jwtToken);
        Task<bool> UpdateAccountStatus(int accountNumber, string jwtToken);
    }
}
