using CustomerService.Models;
using CustomerService.Repo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CustomerService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CustomerController : ControllerBase
    {

        //private readonly IConfiguration _configuration;
        private readonly ICustomerRepo _customerRepo;

        public CustomerController(ICustomerRepo customerRepo)
        {
            //_configuration = configuration;
            _customerRepo = customerRepo;
        }

        [HttpGet("GetCustomer")]
        public async Task<ActionResult<Customer>> GetCustomerById(int id)
        {
            var customer = await _customerRepo.GetCustomer(id);
            if (customer!= null)
            {
                return customer;
            }
            return BadRequest("Customer not found!");
        }


        [HttpPost("CreateCustomer")]
        public async Task<ActionResult<Customer>> CreateCustomer(string Name, string Mobile, string Email, string Address)
        {
            var customer = new Customer
            {
                CustomerName = Name,
                CustomerMobile = Mobile,
                CustomerEmail = Email,
                CustomerAddress = Address
            };
            var existingCustomer = await _customerRepo.GetCustomer(customer.CustomerId);
            if (existingCustomer != null)
            {
                return BadRequest("Customer already exists.");
            }

            var custom = await _customerRepo.CreateCustomer(customer);
            return custom;
        }


        [HttpPut("UpdateCustomer")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Customer>> UpdateCustomer(int CustomerId,string? Name=null, string? Mobile=null, string? Email = null, string? Address = null)
        {
            var customer = new Customer
            {
                CustomerId = CustomerId,
                CustomerName = Name,
                CustomerMobile = Mobile,
                CustomerEmail = Email,
                CustomerAddress = Address
            };
            var custom = await _customerRepo.UpdateCustomer(customer.CustomerId, customer);
            if (custom != null)
            {
                return custom;
            }
            return BadRequest("Customer could not update!! Either Deactivated or Customer Not Found!!! ");
        }

        [HttpDelete("DeleteCustomer")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> DeleteCustomer(int id)
        {
            var res = await _customerRepo.DeleteCustomer(id);
            if (!res)
            {
                return BadRequest("Customer could not delete or Not available");
            }
            return Ok("Delete Successfully");
        }

        [HttpPatch("ActivateCustomer")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Customer>> ActivateCustomer(int CustomerId)
        {
            var custom = await _customerRepo.ActivateCustomer(CustomerId);
            if (custom != null)
            {
                return custom;
            }
            return BadRequest("Failed!! Enter correct id or Customer already activated !!");
        }
    }
}
