using System.ComponentModel.DataAnnotations;
using TransactionService.Common;

namespace TransactionService.Models.RequestModels
{
    public class TransactionRequestModel
    {
        [Required]
        public int AccountNumber { get; set; }

        [Required]
        [Range(0.01, 100000, ErrorMessage = "For ATM transactions, amount must not exceed 100000")]
        public decimal TransactionAmount { get; set; }

        [Required]
        public string TransactionMode { get; set; } = string.Empty; // Accept as string

        [Required]
        public string TransactionType { get; set; } = string.Empty; // Accept as string

        public bool IsValidTransactionMode()
        {
            return Enum.TryParse<TransactionMode>(TransactionMode, true, out _);
        }

        public bool IsValidTransactionType()
        {
            return Enum.TryParse<TransactionType>(TransactionType, true, out _);
        }
    }
}