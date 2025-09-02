namespace AccountService.Models
{
    public class Account
    {
        public int AccountNumber { get; set; }
        public int CustomerId { get; set; }
        public decimal AccountBalance { get; set; }
        public string AccountType { get; set; } = string.Empty; // Store as string
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Activate;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime AccountUpdateOn { get; set; } = DateTime.UtcNow;
    }
}