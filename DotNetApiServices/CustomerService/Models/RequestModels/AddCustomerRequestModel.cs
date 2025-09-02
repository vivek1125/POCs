namespace CustomerService.Models.RequestModels
{
    public class AddCustomerRequestModel
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerMobile { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
    }
}