using AccountService.APIServices;
using AccountService.DBContext;
using AccountService.Exceptions;
using AccountService.Models;
using AccountService.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AccountService.Repos
{
    public class AccountRepo : IAccountRepo
    {
        private readonly AccountDbContext _context;
        private readonly CustomerApiClient _customerApiClient;

        public AccountRepo(AccountDbContext context, CustomerApiClient customerApiClient)
        {
            _context = context;
            _customerApiClient = customerApiClient;
        }

        public async Task<Account?> GetAccountByNumberAsync(int accountNumber)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);
            if (account == null)
                throw new AccountNotFoundException(accountNumber);
            return account;
        }
        public async Task<Account> GetAccountsByCustIdAsync(int custId)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.CustomerId == custId);
            if (account == null)
                throw new AccountNotFoundException($"No accounts found for customer ID {custId}");
            return account;
        }

        public async Task<List<Account>> GetAllAccountsAsync()
        {
            return await _context.Accounts.ToListAsync();
        }

        public async Task<AccountCustomerDTO?> GetAccountWithCustomerDetailsAsync(int accountNumberOrId)
        {
            var inputStr = accountNumberOrId.ToString();

            Task<Account>? accountFetchTask;
            if (inputStr.StartsWith("900", StringComparison.Ordinal))
            {
                accountFetchTask = GetAccountByNumberAsync(accountNumberOrId);
            }
            else if (inputStr.StartsWith("210", StringComparison.Ordinal))
            {
                accountFetchTask = GetAccountsByCustIdAsync(accountNumberOrId);
            }
            else
            {
                throw new ArgumentException(
                    $"Input '{inputStr}' does not match expected account or customer ID patterns.");
            }

            var account = await accountFetchTask;
            if (account == null)
                throw new AccountNotFoundException(accountNumberOrId);

            var customer = await _customerApiClient.GetCustomerAsync(account.CustomerId);
            if (customer == null)
                throw new CustomerValidationFailedException(
                    $"Customer not found for account {accountNumberOrId}");

            return new AccountCustomerDTO
            {
                AccountNumber = account.AccountNumber,
                AccountBalance = account.AccountBalance,
                AccountType = account.AccountType, // Already string
                IsActivated = account.AccountStatus == AccountStatus.Activate,
                CreatedOn = account.CreatedOn,
                AccountUpdateOn = account.AccountUpdateOn,
                Customer = customer
            };
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            if (account.AccountBalance < 0)
                throw new InvalidBalanceException(account.AccountBalance);

            var customer = await _customerApiClient.GetCustomerAsync(account.CustomerId);
            if (customer == null)
                throw new CustomerValidationFailedException(account.CustomerId);

            if (customer.Status != "Activate")
                throw new CustomerValidationFailedException($"Customer {account.CustomerId} is not active");

            // Validate AccountType string against enum (ignore case)
            if (!Enum.TryParse<AccountType>(account.AccountType, true, out var validType))
                throw new ArgumentException($"Invalid AccountType: {account.AccountType}");

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<Account?> UpdateBalanceAsync(int accountNumber, decimal newBalance, DateTime updateOn)
        {
            if (newBalance < 0)
                throw new InvalidBalanceException(newBalance);

            var account = await _context.Accounts.FindAsync(accountNumber);
            if (account == null)
                throw new AccountNotFoundException(accountNumber);

            if (account.AccountStatus == AccountStatus.Deactivate)
                throw new InactiveAccountException(accountNumber);

            account.AccountBalance = newBalance;
            account.AccountUpdateOn = updateOn;
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> DeactivateAccountAsync(int accountNumber)
        {
            var account = await _context.Accounts.FindAsync(accountNumber);
            if (account == null)
                throw new AccountNotFoundException(accountNumber);

            account.AccountStatus = AccountStatus.Deactivate;
            account.AccountUpdateOn = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateAccountAsync(int accountNumber)
        {
            var account = await _context.Accounts.FindAsync(accountNumber);
            if (account == null)
                throw new AccountNotFoundException(accountNumber);

            account.AccountStatus = AccountStatus.Activate;
            account.AccountUpdateOn = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}