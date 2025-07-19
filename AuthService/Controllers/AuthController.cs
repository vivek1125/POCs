using AuthService.Repo;
using AuthService.DBContext;
using AuthService.Models;
using AuthService.Models.RequestModels;
using AuthService.Models.ResponseModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthRepo _authRepo;

        public AuthController(IConfiguration configuration,IAuthRepo authRepo)
        {
            _configuration = configuration;
            _authRepo = authRepo;
        }

        [HttpGet("getUser")]
        public async Task<ActionResult<LogInRes>> GetUserByUserName(string userName)
        {
            var existingUser = await _authRepo.GetUser(userName);
            if(existingUser == null)
            {
                return BadRequest("User Not Found!");
            }
            UserRole userRole = existingUser.Role;
            string userRolestr = Enum.GetName(typeof(UserRole), userRole);
            var res = new LogInRes
            {
                UserName = existingUser.UserName,
                Email = existingUser.Email,
                Role = userRolestr,//.ToString()
                Token = "*********************"
            };

            return Ok(res);
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(Registration registration)
        {
            User newUser = await _authRepo.Register(registration);

            if (newUser == null)
            {
                return BadRequest("User Already Reagistred");
            }

            return Ok(newUser);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LogInRes>> Login(LogInReq logInReq)
        {
            LogInRes logInRes = await _authRepo.Login(logInReq);

            return Ok(logInRes);
        }

    }
}
