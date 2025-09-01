namespace TransactionService.Exceptions
{
    public class InsufficientBalanceException : Exception
    {
        public InsufficientBalanceException() : base("Insufficient balance for the transaction") { }
        public InsufficientBalanceException(decimal available, decimal required) 
            : base($"Insufficient balance. Available: {available}, Required: {required}") { }
    }

    public class TransactionValidationException : Exception
    {
        public TransactionValidationException(string message) : base(message) { }
    }

    public class AccountValidationException : Exception
    {
        public AccountValidationException(string message) : base(message) { }
    }
}