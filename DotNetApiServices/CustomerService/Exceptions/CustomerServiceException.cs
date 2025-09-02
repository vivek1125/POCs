namespace CustomerService.Exceptions
{
    public class CustomerNotFoundException : Exception
    {
        public CustomerNotFoundException() : base("Customer not found") { }
        public CustomerNotFoundException(int customerId) 
            : base($"Customer with ID {customerId} not found") { }
        public CustomerNotFoundException(string message) : base(message) { }
        public CustomerNotFoundException(string message, Exception inner) : base(message, inner) { }
    }

    public class CustomerValidationException : Exception
    {
        public CustomerValidationException() : base("Invalid customer data") { }
        public CustomerValidationException(string message) : base(message) { }
        public CustomerValidationException(string message, Exception inner) : base(message, inner) { }
    }

    public class CustomerAlreadyExistsException : Exception
    {
        public CustomerAlreadyExistsException() : base("Customer already exists") { }
        public CustomerAlreadyExistsException(string mobile) 
            : base($"Customer with mobile number {mobile} already exists") { }
        public CustomerAlreadyExistsException(string message, Exception inner) : base(message, inner) { }
    }
}