using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransactionService.ApiServices;
using TransactionService.Common;
using TransactionService.DBContext;
using TransactionService.Models;
using TransactionService.Models.ResponseModels;
using TransactionService.Repo;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TransactionService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransRepo _transactionRepo;
        private readonly IConfiguration _configuration;
        private readonly int limitDebit = 100000;
        public TransactionController(IConfiguration configuration, ITransRepo transactionRepo)
        {
            _configuration = configuration;
            _transactionRepo = transactionRepo;
        }

        [HttpGet("LastFiveTransaction")]
        public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetTransaction(int accountNumber)
        {
            var transaction = await _transactionRepo.GetTransaction(accountNumber);
            if (transaction.Count!=0)
            {
                var trans = transaction.Select(trans => new TransactionResponse
                {
                    TransactionId = trans.TransactionId,
                    AccountNumber = trans.AccountNumber,
                    TransactionAmount = trans.TransactionAmount,
                    TransactionMode = Enum.GetName(typeof(TransactionMode), trans.TransactionMode),
                    TransactionType = Enum.GetName(typeof(TransactionType), trans.TransactionType),
                    TransDateTime = trans.TransDateTime
                });
                return Ok(trans);
            }
            return BadRequest("Transaction Failed. Please check the account number");
        }

        [HttpPatch("UpdateBalance")]
        public async Task<ActionResult<Transaction>> UpdateBalance(int accountNumber, decimal balance,string transactionType, string transactionMode)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (balance != 0)
            {
                if (Enum.TryParse(transactionType, true, out TransactionType parsedType) && 
                    Enum.IsDefined(typeof(TransactionType), parsedType) &&
                    Enum.TryParse(transactionMode, true, out TransactionMode parsedMode) &&
                    Enum.IsDefined(typeof(TransactionMode), parsedMode)
                    )
                {
                    if(TransactionType.Debit == parsedType && balance > limitDebit)
                    {
                        return BadRequest("Transaction Failed !! (Debit limit : 1,00,000)");
                    }
                    var trans = await _transactionRepo.UpdateAmount(accountNumber, balance, parsedType, parsedMode,jwtToken);
                    if (trans != null)
                    {
                        var transaction = new TransactionResponse
                        {
                            TransactionId = trans.TransactionId,
                            AccountNumber = trans.AccountNumber,
                            TransactionAmount = trans.TransactionAmount,
                            TransactionMode = Enum.GetName(typeof(TransactionMode), trans.TransactionMode),
                            TransactionType = Enum.GetName(typeof(TransactionType), trans.TransactionType),
                            TransDateTime = trans.TransDateTime
                        };
                        return Ok(transaction);
                    }
                }
                
            }
            return BadRequest("Transaction Failed !");
        }
    }
}
