using AccountService.ApiServices;
using AccountService.Models;
using AccountService.Models.RequestModels;
using AccountService.Models.ResponseModels;
using AccountService.Repo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AccountService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepo _accountrepo;
        private readonly IConfiguration _configuration;

        public AccountController(IConfiguration configuration, IAccountRepo accountRepo)
        {
            _configuration = configuration;
            _accountrepo = accountRepo;
        }

        [HttpGet("getAccount")]
        public async Task<ActionResult<Account>> GetAccountByNumber(int accountNumber)
        {
            var account = await _accountrepo.GetAccountDetails(accountNumber);
            if (account != null)
            {
                return Ok(account);
            }
            return BadRequest("Account not found!");
        }

        [HttpGet("getCustomer")]
        public async Task<ActionResult<AccountCustomerDTOs>> GetCustomerDetailsByAccNo(int account_NumberOrCust_Id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            var customerDetail = await _accountrepo.GetCustomerDetails(account_NumberOrCust_Id, jwtToken);
            if (customerDetail != null)
            {
                return Ok(customerDetail);
            }
            return BadRequest("Customer No Found, Please check account no!");
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AccountRes>> CreateAccount(AccountReq account)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            
            if (account != null)
            {
                var createdAccount = await _accountrepo.CreateAccount(account, jwtToken);
                if (createdAccount != null)
                {
                    return CreatedAtAction(nameof(GetAccountByNumber), new { accountNumber = createdAccount.AccountNumber }, createdAccount);
                }
            }
            return BadRequest("Failed to Create Account !!");
        }

        [HttpPatch]
        public async Task<ActionResult<Account>> UpdateBalance(int accountNumber, decimal balance,DateTime updatedOn)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (balance != 0)
            {
                var accountUpdatedBalance = await _accountrepo.UpdateAccountBalance(accountNumber,balance,updatedOn, jwtToken);
                if (accountUpdatedBalance != null)
                {
                    return accountUpdatedBalance;
                }
            }
            return BadRequest("failed to Update balance!");
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAccount(int accountNumber)
        {
            bool status = await _accountrepo.DeleteAccount(accountNumber);
            if (!status)
            {
                return BadRequest("Account Deletion Filed!");
            }
            return Ok("Account deleted!");
        }

        [HttpPatch("UnFreeze")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> UnFreeze(int accountNumber)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var accountStatus = await _accountrepo.UpdateAccountStatus(accountNumber, jwtToken);
            if (accountStatus)
            {
                return Ok("Now Account is Activate!!!");
            }
            return BadRequest("failed to Update Status!");
        }
    }
}
