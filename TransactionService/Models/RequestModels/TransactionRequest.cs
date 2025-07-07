namespace TransactionService.Models.RequestModels
{
    public class TransactionRequest
    {
        public int AccountNumber { get; set; }
        public string TransactionMode { get; set; }
        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
    }
}
