using AccountService.ApiServices;
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
        private readonly ICustomerApiClient _customerApiClient;

        public AccountRepo(AccountDBContext dBContext, IConfiguration configuration, ICustomerApiClient customerApiClient)
        {
            _dBContext = dBContext;
            _configuration = configuration;
            _customerApiClient = customerApiClient;
        }
        public async Task<Account> GetAccountDetails(int accNumber)
        {
            var account = await _dBContext.Accounts
                .Where(acc => acc.AccountNumber == accNumber || acc.CustomerId == accNumber)
                .FirstOrDefaultAsync();
            if (account == null)
            {
                return null;
            }
            return account;
        }
        public async Task<AccountRes> CreateAccount(AccountReq account)
        {
            // To Insert into DatabAse
            var newAccount = new Account
            {
                CustomerId = account.CustomerId,
                AccountBalance = account.AccountBalance,
                IsFrozen = false
            };

            if (Enum.TryParse(account.AccountType, true, out AccountType parsedType) && Enum.IsDefined(typeof(AccountType), parsedType))
            {
                newAccount.AccountType = parsedType;
            }
            else
            {
                return null;
            }

            var ExistingAccount = await _dBContext.Accounts.AddAsync(newAccount);
            if (ExistingAccount == null)
            {
                return null;
            }
            
            // For Response to API
            var accRes = new AccountRes
            {
                CustomerId = ExistingAccount.Entity.CustomerId,
                AccountNumber = ExistingAccount.Entity.AccountNumber,
                AccountBalance = ExistingAccount.Entity.AccountBalance,
                AccountType = account.AccountType,
                IsFrozen = false,
                CreatedDate = ExistingAccount.Entity.CreatedDate,
                AccUpdateDateTime = ExistingAccount.Entity.AccUpdateDateTime
            };
            
            try
            {
                await _dBContext.SaveChangesAsync();
                return accRes;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Account> UpdateAccountBalance(int accountNumber, decimal balance, DateTime updatedOn)
        {
            var existingAccount = await GetAccountDetails(accountNumber);
            if (existingAccount == null)
            {
                return null;
            }

            existingAccount.AccountBalance = balance;

            if (updatedOn == DateTime.MinValue)
            {
                updatedOn = DateTime.Now;
            }

            existingAccount.AccUpdateDateTime = updatedOn;

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

            var customers = await _customerApiClient.GetCustomerAsync(existingAccount.CustomerId); 

            if(customers == null)
            {
                return null;
            }

            var customerAccount = new AccountCustomerDTOs
            {
                AccountNumber = existingAccount.AccountNumber,
                AccountBalance = existingAccount.AccountBalance,
                AccountType = existingAccount.AccountType,
                AccUpdatedOn = existingAccount.AccUpdateDateTime,
                Customer = new Customer
                {
                    CustomerId = customers.CustomerId,
                    CustomerName = customers.CustomerName,
                    CustomerMobile = customers.CustomerMobile,
                    CustomerEmail = customers.CustomerEmail,
                    CustomerAddress = customers.CustomerAddress
                }
            };

            return customerAccount;
        }

    }
}
