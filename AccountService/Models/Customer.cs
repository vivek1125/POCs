using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AccountService.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }

        public string CustomerEmail { get; set; }

        public string CustomerMobile { get; set; }

        public string CustomerAddress { get; set; }
        public string CustomerStatus { get; set; }
    }
}
