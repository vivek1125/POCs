using Microsoft.EntityFrameworkCore;
using AccountService.Exceptions;
using TransactionService.Data;
using TransactionService.Models.Exceptions;
using TransactionService.Models;
using TransactionService.Models.ResponseModels;
using TransactionService.Models.Entities;
using TransactionService.APIServices;
using TransactionService.Common;
using TransactionService.Models.RequestModels;

namespace TransactionService.Repos
{
    public class TransactionRepo : ITransactionRepo
    {
        private readonly TransactionDbContext _context;
        private readonly AccountApiClient _accountApiClient;

        public TransactionRepo(TransactionDbContext context, AccountApiClient accountApiClient)
        {
            _context = context;
            _accountApiClient = accountApiClient;
        }

        public async Task<IEnumerable<TransactionEntity>> GetTransactionsAsync(int accountNumber, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Transactions.AsQueryable();

            query = query.Where(t => t.AccountNumber == accountNumber);

            if (fromDate.HasValue)
            {
                query = query.Where(t => t.TransactionOn >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(t => t.TransactionOn <= toDate.Value);
            }

            return await query.OrderByDescending(t => t.TransactionOn).ToListAsync();
        }

        public async Task<IEnumerable<TransactionEntity>> GetLastNTransactionsAsync(int accountNumber, int count)
        {
            return await _context.Transactions
                .Where(t => t.AccountNumber == accountNumber)
                .OrderByDescending(t => t.TransactionOn)
                .Take(count)
                .ToListAsync();
        }

        public async Task<TransactionResponseModel> ProcessTransactionAsync(TransactionService.Models.RequestModels.TransactionRequestModel request, decimal currentBalance)
        {
            // Validate transaction amount and balance
            // Validate TransactionMode and TransactionType strings against enums (ignore case)
            if (!Enum.TryParse<TransactionMode>(request.TransactionMode, true, out var mode))
                throw new InvalidTransactionAmountException($"Invalid TransactionMode: {request.TransactionMode}");
            if (!Enum.TryParse<TransactionType>(request.TransactionType, true, out var type))
                throw new InvalidTransactionAmountException($"Invalid TransactionType: {request.TransactionType}");

            await ValidateTransactionAmountAsync(request, mode);
            await ValidateBalanceForDebitAsync(request, type, currentBalance);

            // Calculate new balance
            var newBalance = CalculateNewBalance(type, request.TransactionAmount, currentBalance);

            // Create transaction record
            var transaction = new TransactionEntity
            {
                TransactionId = Guid.NewGuid(),
                AccountNumber = request.AccountNumber,
                TransactionAmount = request.TransactionAmount,
                TransactionMode = mode,
                TransactionType = type,
                TransactionOn = DateTime.UtcNow,
                Status = TransactionStatus.Pass
            };

            try
            {
                // Update balance in account service
                var updateResult = await _accountApiClient.UpdateBalanceAsync(
                    request.AccountNumber,
                    newBalance,
                    transaction.TransactionOn);

                if (!updateResult)
                {
                    transaction.Status = TransactionStatus.Failed;
                    await CreateTransactionAsync(transaction);
                    throw new TransactionFailedException("Failed to update account balance");
                }

                // Save successful transaction
                await CreateTransactionAsync(transaction);

                return new TransactionResponseModel
                {
                    TransactionId = transaction.TransactionId,
                    AccountNumber = transaction.AccountNumber,
                    TransactionAmount = transaction.TransactionAmount,
                    TransactionMode = transaction.TransactionMode.ToString(),
                    TransactionType = transaction.TransactionType.ToString(),
                    TransactionOn = transaction.TransactionOn,
                    Status = transaction.Status.ToString(),
                    UpdatedBalance = newBalance
                };
            }
            catch (Exception)
            {
                transaction.Status = TransactionStatus.Failed;
                await CreateTransactionAsync(transaction);
                throw;
            }
        }

        public async Task<TransactionEntity> CreateTransactionAsync(TransactionEntity transaction)
        {
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task ValidateTransactionAmountAsync(TransactionService.Models.RequestModels.TransactionRequestModel request)
        {
            if (!Enum.TryParse<TransactionMode>(request.TransactionMode, true, out var mode))
                throw new InvalidTransactionAmountException($"Invalid TransactionMode: {request.TransactionMode}");
            await ValidateTransactionAmountAsync(request, mode);
        }

        public async Task ValidateBalanceForDebitAsync(TransactionService.Models.RequestModels.TransactionRequestModel request, decimal currentBalance)
        {
            if (!Enum.TryParse<TransactionType>(request.TransactionType, true, out var type))
                throw new InvalidTransactionAmountException($"Invalid TransactionType: {request.TransactionType}");
            await ValidateBalanceForDebitAsync(request, type, currentBalance);
        }

        public async Task ValidateTransactionAmountAsync(TransactionService.Models.RequestModels.TransactionRequestModel request, TransactionMode mode)
        {
            if (mode == TransactionMode.ATM && request.TransactionAmount > 100000)
            {
                throw new InvalidTransactionAmountException("ATM transactions cannot exceed 100,000");
            }

            if (request.TransactionAmount <= 0)
            {
                throw new InvalidTransactionAmountException("Transaction amount must be greater than zero");
            }

            await Task.CompletedTask;
        }

        public async Task ValidateBalanceForDebitAsync(TransactionService.Models.RequestModels.TransactionRequestModel request, TransactionType type, decimal currentBalance)
        {
            if (type == TransactionType.Debit && currentBalance < request.TransactionAmount)
            {
                throw new InvalidBalanceException(request.TransactionAmount);
            }

            await Task.CompletedTask;
        }

        private decimal CalculateNewBalance(TransactionType type, decimal amount, decimal currentBalance)
        {
            return type == TransactionType.Credit
                ? currentBalance + amount
                : currentBalance - amount;
        }
    }
}