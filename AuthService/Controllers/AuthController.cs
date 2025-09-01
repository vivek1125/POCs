using AuthService.Models;
using AuthService.Models.RequestModels;
using AuthService.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepo _authRepo;
        public AuthController(IAuthRepo authRepo)
        {
            _authRepo = authRepo;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest dto)
        {
            var user = await _authRepo.AuthenticateAsync(dto.UserName, dto.Password);
            if (user == null)
                return Unauthorized("Invalid credentials");
            var token = await _authRepo.GenerateJwtTokenAsync(user);
            return Ok(new { user.UserName, user.Email, user.Role, Token = token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
        {
            var user = await _authRepo.RegisterAsync(dto.UserName, dto.Email, dto.Password, dto.Role);
            if (user == null)
                return BadRequest("Registration failed. User may already exist or role is invalid.");
            return Ok(new { user.UserName, user.Email, user.Role });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authRepo.GetAllUsersAsync();
            return Ok(users.Select(u => new { u.Id, u.UserName, u.Email, u.Role }));
        }
    }
}