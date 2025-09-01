using Microsoft.AspNetCore.Mvc;

namespace APIGateway.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { 
                Status = "Healthy", 
                Service = "API Gateway",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0"
            });
        }

        [HttpGet("services")]
        public IActionResult GetServices()
        {
            return Ok(new
            {
                Services = new[]
                {
                    new { Name = "AuthService", Url = "https://localhost:7201", Status = "Available" },
                    new { Name = "CustomerService", Url = "https://localhost:7202", Status = "Available" },
                    new { Name = "AccountService", Url = "https://localhost:7203", Status = "Available" },
                    new { Name = "TransactionService", Url = "https://localhost:7204", Status = "Available" }
                },
                Gateway = new { Name = "APIGateway", Url = "https://localhost:7210", Status = "Running" }
            });
        }
    }
}