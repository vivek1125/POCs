namespace CustomerService.Models.RequestModels
{
    public class GetCustomerRequestModel
    {
        public int? CustomerId { get; set; }
        public string? CustomerMobile { get; set; }
    }
}