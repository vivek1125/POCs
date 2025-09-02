using TransactionService.Common;

namespace TransactionService.Models.Entities
{
    public class TransactionEntity
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