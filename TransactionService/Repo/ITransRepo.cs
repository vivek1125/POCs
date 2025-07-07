using TransactionService.Common;
using TransactionService.Models;

namespace TransactionService.Repo
{
    public interface ITransRepo
    {
        Task<Transaction> UpdateAmount(int accNumber, decimal balance, TransactionType transactionType, TransactionMode transactionMode);
    }
}
