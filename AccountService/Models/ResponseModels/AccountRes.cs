using AccountService.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.ResponseModels
{
    public class AccountRes
    {
        public int AccountNumber { get; set; }
        public int CustomerId { get; set; }
        public decimal AccountBalance { get; set; }
        public string AccountType { get; set; }
        public bool IsFrozen { get; set; } = false;
        public DateTime CreatedDate { get; set; }
        public DateTime AccUpdateDateTime { get; set; } 
    }
}
