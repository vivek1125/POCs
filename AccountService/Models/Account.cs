using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models
{
    public class Account
    {
        [Key]
        public int AccountId { get; set; }
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; }
        public int AccountNumber { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }

    }
}
