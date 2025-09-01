namespace AccountService.Exceptions
{
    public class AccountNotFoundException : Exception
    {
        public AccountNotFoundException() : base("Account not found") { }
        public AccountNotFoundException(int accountNumber) 
            : base($"Account with number {accountNumber} not found") { }
        public AccountNotFoundException(string message) : base(message) { }
        public AccountNotFoundException(string message, Exception inner) : base(message, inner) { }
    }

    public class AccountValidationException : Exception
    {
        public AccountValidationException() : base("Invalid account data") { }
        public AccountValidationException(string message) : base(message) { }
        public AccountValidationException(string message, Exception inner) : base(message, inner) { }
    }

    public class InactiveAccountException : Exception
    {
        public InactiveAccountException() : base("Account is not active") { }
        public InactiveAccountException(int accountNumber) 
            : base($"Account {accountNumber} is not active") { }
        public InactiveAccountException(string message) : base(message) { }
        public InactiveAccountException(string message, Exception inner) : base(message, inner) { }
    }

    public class InvalidBalanceException : Exception
    {
        public InvalidBalanceException() : base("Invalid balance amount") { }
        public InvalidBalanceException(decimal amount) 
            : base($"Invalid balance amount: {amount}") { }
        public InvalidBalanceException(string message) : base(message) { }
        public InvalidBalanceException(string message, Exception inner) : base(message, inner) { }
    }

    public class CustomerValidationFailedException : Exception
    {
        public CustomerValidationFailedException() : base("Customer validation failed") { }
        public CustomerValidationFailedException(int customerId) 
            : base($"Customer validation failed for ID: {customerId}") { }
        public CustomerValidationFailedException(string message) : base(message) { }
        public CustomerValidationFailedException(string message, Exception inner) : base(message, inner) { }
    }
}