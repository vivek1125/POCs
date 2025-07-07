using Microsoft.Identity.Client;
using TransactionService.ApiServices;
using TransactionService.Common;
using TransactionService.DBContext;
using TransactionService.Models;

namespace TransactionService.Repo
{
    public class TransRepo : ITransRepo
    {
        private readonly TransactionDBContext _transactionDBContext;
        private readonly IAccountApiClient _accountApiClient;
        private readonly IConfiguration _configuration;
        private readonly int limit = 1000;
        public TransRepo(IConfiguration configuration, TransactionDBContext transactionDBContext, IAccountApiClient accountApiClient)
        {
            _configuration = configuration;
            _transactionDBContext = transactionDBContext;
            _accountApiClient = accountApiClient;

        }
        public async Task<Transaction> UpdateBalance(int accountNumber, decimal amount, TransactionMode transactionMode, TransactionType transactionType)
        {
            var accountDetails = await _accountApiClient.GetAccountDetailsAsync(accountNumber);
            if (accountDetails == null)
            {
                return null;
            }
            decimal availableBalance = accountDetails.AccountBalance;
            if(transactionType == TransactionType.Credit)
            {
                decimal balance = availableBalance + amount;
                var transaction = new Transaction
                {
                    AccountNumber = accountNumber,
                    TransactionMode = transactionMode,
                    TransactionType = transactionType,
                    TransactionAmount = amount,
                    TransDateTime = DateTime.Now
                };
                var updateAccBalance = await _accountApiClient.UpdateAccountAmountAsync(accountNumber, balance, transaction.TransDateTime);
                if (updateAccBalance == null)
                {
                    return null;
                }
                return transaction;
            }

            if((availableBalance > amount) && transactionType == TransactionType.Debit)
            {
                decimal balance = availableBalance - amount;
                if (balance >= limit)
                {
                    var transaction = new Transaction
                    {
                        AccountNumber = accountNumber,
                        TransactionMode = transactionMode,
                        TransactionType = transactionType,
                        TransactionAmount = amount,
                        TransDateTime = DateTime.Now
                    };
                    var updateAccBalance = await _accountApiClient.UpdateAccountAmountAsync(accountNumber, balance, transaction.TransDateTime);
                    if(updateAccBalance == null)
                    {
                        return null;
                    }
                    return transaction;
                }
            }

            return null;
        }

        public async Task<Transaction> UpdateAmount(int accNumber, decimal balance,TransactionType transactionType, TransactionMode transactionMode)
        {
            var transactions = await UpdateBalance(accNumber, balance, transactionMode, transactionType);
            
            try
            {
                if (transactions != null)
                {
                    _transactionDBContext.Transactions.Add(transactions);
                    await _transactionDBContext.SaveChangesAsync();
                    return transactions;
                }
            }
            catch
            {
                return null;
            }
            return null;
        }
    }
}
