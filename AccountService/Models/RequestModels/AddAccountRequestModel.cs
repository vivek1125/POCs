namespace AccountService.Models.RequestModels
{
    public class AddAccountRequestModel
    {
        public int CustomerId { get; set; }
        public decimal InitialBalance { get; set; }
        public string AccountType { get; set; } = string.Empty; // Accept as string
    }
}