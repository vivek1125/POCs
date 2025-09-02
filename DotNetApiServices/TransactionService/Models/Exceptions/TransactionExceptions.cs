namespace TransactionService.Models.Exceptions
{
    public class InvalidTransactionAmountException : Exception
    {
        public InvalidTransactionAmountException(string message) : base(message)
        {
        }
    }

    public class TransactionFailedException : Exception
    {
        public TransactionFailedException(string message) : base(message)
        {
        }
    }
}