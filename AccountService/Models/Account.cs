using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models
{
    public class Account
    {
        [Key]
        public int AccountNumber { get; set; }
        [Required]
        [ForeignKey("Customer")]
        public int CustomerId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AccountBalance { get; set; }
        public string Bank { get; set; } = "Lena Dena Bank";
        public AccountType AccountType { get; set; }
        public bool IsFrozen { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime AccUpdateDateTime { get; set; } = DateTime.Now;

    }
}
