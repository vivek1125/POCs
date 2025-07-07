using CustomerService.Models;
using CustomerService.Repo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CustomerService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
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
        [Authorize]
        public async Task<ActionResult<Customer>> CreateCustomer([FromBody]Customer customer)
        {
            var existingCustomer = await _customerRepo.GetCustomer(customer.CustomerId);
            if (existingCustomer != null)
            {
                return BadRequest("Customer already exists.");
            }

            var custom = await _customerRepo.CreateCustomer(customer);
            return custom;
        }


        [HttpPut("UpdateCustomer")]
        public async Task<ActionResult<Customer>> UpdateCustomer(Customer customer)
        {
            var custom = await _customerRepo.UpdateCustomer(customer.CustomerId, customer);
            if (custom != null)
            {
                return custom;
            }
            return customer;
        }

        [HttpDelete("DeleteCustomer")]
        public async Task DeleteCustomer(int id)
        {
            await _customerRepo.DeleteCustomer(id);
        }
    }
}
