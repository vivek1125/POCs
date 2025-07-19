using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CustomerService.Models
{
    public class Customer
    {
        [Key]
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }

        public string CustomerEmail { get; set; }

        public string CustomerMobile { get; set; }

        public string CustomerAddress { get; set; }
        //public CustomerStatus CustomerStatus { get; set; } = CustomerStatus.Activate;
        public string CustomerStatus { get; set; } = "Active";
    }
}
