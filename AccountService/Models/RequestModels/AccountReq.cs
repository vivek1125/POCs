using AccountService.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.RequestModels
{
    public class AccountReq
    {
        public int CustomerId { get; set; }
        public decimal AccountBalance { get; set; }
        public string AccountType { get; set; }      
    }
}
