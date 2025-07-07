using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TransactionService.Common;

namespace TransactionService.Models
{
    public class Transaction
    {
        [Key]
        public Guid TransactionId { get; set; }
        public int AccountNumber { get; set; }
        public TransactionMode TransactionMode { get; set; }
        public TransactionType TransactionType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TransactionAmount { get; set; }
        public DateTime TransDateTime { get; set; } = DateTime.Now;

    }
}
