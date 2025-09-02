using TransactionService.Models.ResponseModels;
using TransactionService.Models.Entities;
using TransactionService.Models.RequestModels;

namespace TransactionService.Repos
{
    public interface ITransactionRepo
    {
        Task<IEnumerable<TransactionEntity>> GetTransactionsAsync(int accountNumber, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<TransactionEntity>> GetLastNTransactionsAsync(int accountNumber, int count);
        Task<TransactionResponseModel> ProcessTransactionAsync(TransactionRequestModel request, decimal currentBalance);
        Task<TransactionEntity> CreateTransactionAsync(TransactionEntity transaction);
        Task ValidateTransactionAmountAsync(TransactionRequestModel request);
        Task ValidateBalanceForDebitAsync( TransactionRequestModel request, decimal currentBalance);
    }
}