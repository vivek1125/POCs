using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AccountService.Models
{
    public class AccountCustomerDTOs
    {
        [Key]
        public int AccountId { get; set; }
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }
        public bool IsFrozen { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public Customer Customer { get; set; }
    }
}
