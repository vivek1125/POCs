using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.ResponseModels
{
    public class CustomerAccount
    {
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }
        public string CustomerName { get; set; }

        public string CustomerEmail { get; set; }

        public string CustomerMobile { get; set; }

        public string CustomerAddress { get; set; }
    }
}
