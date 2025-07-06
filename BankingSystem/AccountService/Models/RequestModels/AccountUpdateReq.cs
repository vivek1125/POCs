using AccountService.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AccountService.Models.RequestModels
{
    public class UpdateAccountBalance
    {
        public decimal AccountBalance { get; set; }
    }
}
