using AccountService.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.RequestModels
{
    public class AccountReq
    {
        public int AccountNumber { get; set; }
        public int CustomerId { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; }        
    }
}
