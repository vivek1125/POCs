using CustomerService.Models;
using CustomerService.Models.RequestModels;
using CustomerService.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CustomerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerRepo _customerRepo;

        public CustomerController(ICustomerRepo customerRepo)
        {
            _customerRepo = customerRepo;
        }

        [HttpGet("GetCustomer")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _customerRepo.GetCustomerByIdAsync(id);
            if (customer == null)
                return NotFound();
            return Ok(customer);
        }

        [HttpGet("GetCustomerByMobile")]
        public async Task<IActionResult> GetCustomerByMobile(string mobile)
        {
            var customer = await _customerRepo.GetCustomerByMobileAsync(mobile);
            if (customer == null)
                return NotFound();
            return Ok(customer);
        }

        [HttpGet("GetCustomers")]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _customerRepo.GetAllCustomersAsync();
            return Ok(customers);
        }

        [HttpPost("AddCustomer")]
        public async Task<IActionResult> AddCustomer([FromBody] AddCustomerRequestModel request)
        {
            var customer = new Customer
            {
                CustomerName = request.CustomerName,
                CustomerMobile = request.CustomerMobile,
                CustomerEmail = request.CustomerEmail,
                CustomerAddress = request.CustomerAddress,
                Status = "Activate"
            };

            var result = await _customerRepo.AddCustomerAsync(customer);
            return CreatedAtAction(nameof(GetCustomer), new { id = result.CustomerId }, result);
        }

        [HttpPut("UpdateCustomer/{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] AddCustomerRequestModel request)
        {
            var customer = new Customer
            {
                CustomerId = id,
                CustomerName = request.CustomerName,
                CustomerMobile = request.CustomerMobile,
                CustomerEmail = request.CustomerEmail,
                CustomerAddress = request.CustomerAddress
            };

            var result = await _customerRepo.UpdateCustomerAsync(customer);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("DeleteCustomer/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var result = await _customerRepo.DeactivateCustomerAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("ActivateCustomer/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ActivateCustomer(int id)
        {
            var result = await _customerRepo.ActivateCustomerAsync(id);
            if (!result)
                return NotFound();
            return Ok();
        }
    }
}