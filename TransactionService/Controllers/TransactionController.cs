using Microsoft.AspNetCore.Mvc;
using TransactionService.ApiServices;
using TransactionService.Common;
using TransactionService.DBContext;
using TransactionService.Models;
using TransactionService.Repo;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TransactionService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransRepo _transactionRepo;
        private readonly IConfiguration _configuration;
        public TransactionController(IConfiguration configuration, ITransRepo transactionRepo)
        {
            _configuration = configuration;
            _transactionRepo = transactionRepo;
        }

        [HttpPatch]
        public async Task<ActionResult<Transaction>> UpdateBalance(int accountNumber, decimal balance,string transactionType, string transactionMode)
        {
            if (balance != 0)
            {
                if (Enum.TryParse(transactionType, true, out TransactionType parsedType) && 
                    Enum.IsDefined(typeof(TransactionType), parsedType) &&
                    Enum.TryParse(transactionMode, true, out TransactionMode parsedMode) &&
                    Enum.IsDefined(typeof(TransactionMode), parsedMode)
                    )
                {
                    var transaction = await _transactionRepo.UpdateAmount(accountNumber, balance, parsedType, parsedMode);
                    if (transaction != null)
                    {
                        return transaction;
                    }
                }
                
            }
            return BadRequest("Transaction Failed !");
        }
    }
}
