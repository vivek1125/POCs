using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models.ResponseModels
{
    public class AccountCustomerDTOs
    {
        public int AccountId { get; set; }
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public AccountType AccountType { get; set; }
        public bool IsFrozen { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime AccUpdatedOn { get; set; }
        public Customer Customer { get; set; }
    }
}
