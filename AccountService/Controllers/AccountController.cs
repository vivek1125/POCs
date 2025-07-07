using AccountService.Models;
using AccountService.Models.RequestModels;
using AccountService.Models.ResponseModels;
using AccountService.Repo;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AccountService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
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
            var customerDetail = await _accountrepo.GetCustomerDetails(account_NumberOrCust_Id);
            if (customerDetail != null)
            {
                return Ok(customerDetail);
            }
            return BadRequest("Customer No Found, Please check account no!");
        }

        [HttpPost]
        public async Task<ActionResult<AccountRes>> CreateAccount(AccountReq account)
        {
            if (account != null)
            {
                var createdAccount = await _accountrepo.CreateAccount(account);
                if (createdAccount != null)
                {
                    return CreatedAtAction(nameof(GetAccountByNumber), new { accountNumber = createdAccount.AccountNumber }, createdAccount);
                }
            }
            return BadRequest("Failed to Create Account !");
        }

        [HttpPatch]
        public async Task<ActionResult<Account>> UpdateBalance(int accountNumber, decimal balance,DateTime updatedOn)
        {
            if (balance != 0)
            {
                var accountUpdatedBalance = await _accountrepo.UpdateAccountBalance(accountNumber,balance,updatedOn);
                if (accountUpdatedBalance != null)
                {
                    return accountUpdatedBalance;
                }
            }
            return BadRequest("failed to Uodate balance!");
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
    }
}
