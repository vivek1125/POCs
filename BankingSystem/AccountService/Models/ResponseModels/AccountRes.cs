using AccountService.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.ResponseModels
{
    public class AccountRes
    {
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
    }
}
