using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransactionService.Models
{
    public class Account
    {
        public int CustomerId { get; set; }
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }
        public bool IsFrozen { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime AccUpdateDateTime { get; set; } = DateTime.Now;
    }
}
