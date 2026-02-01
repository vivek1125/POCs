using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AccountService.Exceptions;
using TransactionService.APIServices;
using TransactionService.Models.ResponseModels;
using TransactionService.Models.Exceptions;
using TransactionService.Repos;
using TransactionService.Models.RequestModels;

namespace TransactionService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionRepo _transactionRepo;
        private readonly AccountApiClient _accountApiClient;

        public TransactionController(ITransactionRepo transactionRepo, AccountApiClient accountApiClient)
        {
            _transactionRepo = transactionRepo;
            _accountApiClient = accountApiClient;
        }

        [HttpGet("GetTransactionByDateRange")]
        public async Task<ActionResult<IEnumerable<TransactionResponseModel>>> GetTransactions(
            int accountNumber,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var transactions = await _transactionRepo.GetTransactionsAsync(accountNumber, fromDate, toDate);
            var response = transactions.Select(t => new TransactionResponseModel
            {
                TransactionId = t.TransactionId,
                AccountNumber = t.AccountNumber,
                TransactionAmount = t.TransactionAmount,
                TransactionMode = t.TransactionMode.ToString(),
                TransactionType = t.TransactionType.ToString(),
                TransactionOn = t.TransactionOn,
                Status = t.Status.ToString(),
                UpdatedBalance = t.TransactionAmount // or set as needed
            });

            return Ok(response);
        }

        [HttpPost("UpdateBalance")]
        public async Task<ActionResult<TransactionResponseModel>> ProcessTransaction(
            [FromBody] TransactionRequestModel request)
        {
            // Validate TransactionType and TransactionMode input
            if (!request.IsValidTransactionType())
                return BadRequest($"Invalid TransactionType: {request.TransactionType}");
            if (!request.IsValidTransactionMode())
                return BadRequest($"Invalid TransactionMode: {request.TransactionMode}");

            try
            {
                var currentBalance = await _accountApiClient.GetBalanceAsync(request.AccountNumber);
                var response = await _transactionRepo.ProcessTransactionAsync(request, currentBalance);
                // Map to ResponseModels.TransactionResponseModel
                var result = new TransactionResponseModel
                {
                    TransactionId = response.TransactionId,
                    AccountNumber = response.AccountNumber,
                    TransactionAmount = response.TransactionAmount,
                    TransactionMode = response.TransactionMode,
                    TransactionType = response.TransactionType,
                    TransactionOn = response.TransactionOn,
                    Status = response.Status,
                    UpdatedBalance = response.UpdatedBalance
                };
                return Ok(result);
            }
            catch (InvalidBalanceException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidTransactionAmountException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (TransactionFailedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while processing the transaction");
            }
        }

        [HttpGet("GetLastNTransaction")]
        public async Task<ActionResult<IEnumerable<TransactionResponseModel>>> GetLastNTransactions(
            int count,
            int accountNumber)
        {
            if (count <= 0)
            {
                return BadRequest("Count must be greater than 0");
            }

            var transactions = await _transactionRepo.GetLastNTransactionsAsync(accountNumber, count);
            var response = transactions.Select(t => new TransactionResponseModel
            {
                TransactionId = t.TransactionId,
                AccountNumber = t.AccountNumber,
                TransactionAmount = t.TransactionAmount,
                TransactionMode = t.TransactionMode.ToString(),
                TransactionType = t.TransactionType.ToString(),
                TransactionOn = t.TransactionOn,
                Status = t.Status.ToString()
            });

            return Ok(response);
        }
    }
}