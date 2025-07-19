using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using TransactionService.Common;

namespace TransactionService.Models.ResponseModels
{
    public class TransactionResponse
    {
        public Guid TransactionId { get; set; }
        public int AccountNumber { get; set; }
        public decimal TransactionAmount { get; set; }
        public string TransactionType { get; set; }
        public string TransactionMode { get; set; }
        public DateTime TransDateTime { get; set; } = DateTime.UtcNow;
    }
}
