using AccountService.APIServices;
using AccountService.DBContext;
using AccountService.Models;
using AccountService.Models.RequestModels;
using AccountService.Models.ResponseModels;
using Microsoft.EntityFrameworkCore;

namespace AccountService.Repo
{
    public class AccountRepo : IAccountRepo
    {
        private readonly AccountDBContext _dBContext;
        private readonly IConfiguration _configuration;
        private readonly ICustomerApiClient _customerApi;

        public AccountRepo(AccountDBContext dBContext, IConfiguration configuration, ICustomerApiClient customerApi)
        {
            _dBContext = dBContext;
            _configuration = configuration;
            _customerApi = customerApi;
        }
        public async Task<Account> GetAccountDetails(int accNumber)
        {
            var account = await _dBContext.Accounts
                .Where(a => a.AccountNumber == accNumber || a.CustomerId == accNumber)
                .FirstOrDefaultAsync();
            
            if (account == null)
            {
                return null;
            }
            return account;
        }
        public async Task<Account> CreateAccount(Account account)
        {
            var ExistingAccount = await _dBContext.Accounts.AddAsync(account);
            try
            {
                await _dBContext.SaveChangesAsync();
                return account;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Account> UpdateAccountBalance(int accountNumber, decimal balance)
        {
            var existingAccount = await GetAccountDetails(accountNumber);
            if (existingAccount == null)
            {
                return null;
            }

            existingAccount.AccountBalance = balance;
            
            try
            {
                await _dBContext.SaveChangesAsync();
                return existingAccount;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> DeleteAccount(int accountNumber)
        {
            var existingAccount = await GetAccountDetails(accountNumber);
            if (existingAccount != null)
            {
                _dBContext.Accounts.Remove(existingAccount);
                await _dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<AccountCustomerDTOs> GetCustomerDetails(int accountNumber)
        {
            var existingAccount = await GetAccountDetails(accountNumber);
            if(existingAccount== null)
            {
                return null;
            }
            int customerId = existingAccount.CustomerId;
            var customer = await _customerApi.GetCustomerAsync(customerId);

            if (customer == null)
            {
                return null;
            }

            var customerAccount = new AccountCustomerDTOs
            {
                AccountNumber = existingAccount.AccountNumber,
                AccountBalance = existingAccount.AccountBalance,
                AccountType = existingAccount.AccountType,
                Customer = new Customer
                {
                    CustomerId = customer.CustomerId,
                    CustomerName = customer.CustomerName,
                    CustomerMobile = customer.CustomerMobile,
                    CustomerEmail = customer.CustomerEmail,
                    CustomerAddress = customer.CustomerAddress
                }
            };

            return customerAccount;
        }

        /*public async Task<CustomerAccount> GetCustomerDetail(int accountNumber)
        {
            var customerAccount = await (from account in _dBContext.Accounts
                                         join customer in _dBContext.Customers
                                         on account.CustomerId equals customer.CustomerId
                                         where account.AccountNumber == accountNumber
                                         select new CustomerAccount
                                         {
                                             AccountNumber = account.AccountNumber,
                                             AccountBalance = account.AccountBalance,
                                             AccountType = account.AccountType,
                                             CustomerName = customer.CustomerName,
                                             CustomerMobile = customer.CustomerMobile,
                                             CustomerEmail = customer.CustomerEmail,
                                             CustomerAddress = customer.CustomerAddress
                                         }).FirstOrDefaultAsync();

            return customerAccount;
        }*/

    }
}
