using AccountService.APIServices;
using AccountService.Models;
using AccountService.Models.RequestModels;
using AccountService.Models.ResponseModels;
using AccountService.Repo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<ActionResult<AccountCustomerDTOs>> GetCustomerDetailsByAccNo(int accountNumberOrCustId)
        {
            var customerDetail = await _accountrepo.GetCustomerDetails(accountNumberOrCustId);
            if (customerDetail != null)
            {
                return Ok(customerDetail);
            }
            return BadRequest("Customer Not Found, Please check account no!");
        }

        [HttpPost]
        public async Task<ActionResult<Account>> CreateAccount(Account account, AccountType accountType)
        {
            if (account == null)
            {
                return BadRequest("Invalid account details provided.");
            }

            var createdAccount = await _accountrepo.CreateAccount(account);
            if (createdAccount != null)
            {
                return CreatedAtAction(nameof(GetAccountByNumber), new { accountNumber = createdAccount.AccountNumber }, createdAccount);
            }
            return BadRequest("Failed to create account.");
        }
    }
}
