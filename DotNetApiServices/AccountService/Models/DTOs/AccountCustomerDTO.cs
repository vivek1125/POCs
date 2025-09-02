using AccountService.Models;

namespace AccountService.Models.DTOs
{
    public class AccountCustomerDTO
    {
        public int AccountNumber { get; set; }
        public decimal AccountBalance { get; set; }
        public string AccountType { get; set; } = string.Empty; // Store as string
        public bool IsActivated { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime AccountUpdateOn { get; set; }
        public Customer? Customer { get; set; }
    }
}