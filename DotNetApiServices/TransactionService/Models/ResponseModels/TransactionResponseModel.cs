using TransactionService.Common;

namespace TransactionService.Models.ResponseModels
{
    public class TransactionResponseModel
    {
        public Guid TransactionId { get; set; }
        public int AccountNumber { get; set; }
        public decimal TransactionAmount { get; set; }
        public string TransactionMode { get; set; }
        public string TransactionType { get; set; }
        public DateTime TransactionOn { get; set; }
        public string Status { get; set; }
        public decimal UpdatedBalance { get; set; }
    }
}