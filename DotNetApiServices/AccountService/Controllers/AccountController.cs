using AccountService.APIServices;
using AccountService.Models;
using AccountService.Models.DTOs;
using AccountService.Models.RequestModels;
using AccountService.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepo _accountRepo;
        private readonly CustomerApiClient _customerApiClient;

        public AccountController(IAccountRepo accountRepo, CustomerApiClient customerApiClient)
        {
            _accountRepo = accountRepo;
            _customerApiClient = customerApiClient;
        }

        [HttpGet("GetAccountByAccountNumber")]
        public async Task<IActionResult> GetAccount(int accountNumber)
        {
            var account = await _accountRepo.GetAccountByNumberAsync(accountNumber);
            if (account == null)
                return NotFound();
            return Ok(account);
        }

        [HttpGet("GetAccountDetailsByNoOrCustID")]
        public async Task<IActionResult> GetAccountDetails(int accountNumberOrId)
        {
            var accountDetails = await _accountRepo.GetAccountWithCustomerDetailsAsync(accountNumberOrId);
            if (accountDetails == null)
                return NotFound();
            return Ok(accountDetails);
        }

        [HttpGet("GetAllAccounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var accounts = await _accountRepo.GetAllAccountsAsync();
            return Ok(accounts);
        }

        [HttpPost("CreateAccount") ]
        public async Task<IActionResult> CreateAccount([FromBody] AddAccountRequestModel request)
        {
            // Verify customer exists and is active
            var customer = await _customerApiClient.GetCustomerAsync(request.CustomerId);
            if (customer == null)
                return BadRequest("Invalid CustomerId");
            if (customer.Status != "Activate")
                return BadRequest("Customer is not active");

            var account = new Account
            {
                CustomerId = request.CustomerId,
                AccountBalance = request.InitialBalance,
                AccountType = request.AccountType,
                AccountStatus = AccountStatus.Activate,
                CreatedOn = DateTime.UtcNow,
                AccountUpdateOn = DateTime.UtcNow
            };

            var result = await _accountRepo.CreateAccountAsync(account);
            return CreatedAtAction(nameof(GetAccount), new { accountNumber = result.AccountNumber }, result);
        }

        // If you want balancceUpdateOn to default to DateTime.UtcNow, set it inside the method:
        [HttpPut("UpdateBalance")]
        public async Task<IActionResult> UpdateBalance(int accountNumber, [FromBody] UpdateBalanceRequestModel request, DateTime? balancceUpdateOn = null)
        {
            // Validate Authorization header
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Missing or invalid authorization token");
            }

            // Validate account access based on claims if needed
            // This assumes the JWT token contains relevant claims about account access
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized("User is not authenticated");
            }

            var updateOn = balancceUpdateOn ?? DateTime.UtcNow;
            var result = await _accountRepo.UpdateBalanceAsync(accountNumber, request.NewBalance, updateOn);
            if (result == null)
                return NotFound("Account not found or is inactive");
            return Ok(result);
        }

        [HttpDelete("DeleteAccount")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAccount(int accountNumber)
        {
            var result = await _accountRepo.DeactivateAccountAsync(accountNumber);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("ActivateAccount")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ActivateAccount(int accountNumber)
        {
            var result = await _accountRepo.ActivateAccountAsync(accountNumber);
            if (!result)
                return NotFound();
            return Ok();
        }
    }
}