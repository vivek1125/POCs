using TransactionService.Common;

namespace TransactionService.Models
{
    public class Transaction
    {
        public Guid TransactionId { get; set; }
        public int AccountNumber { get; set; }
        public decimal TransactionAmount { get; set; }
        public TransactionMode TransactionMode { get; set; }
        public TransactionType TransactionType { get; set; }
        public DateTime TransactionOn { get; set; }
        public TransactionStatus Status { get; set; }
    }
}