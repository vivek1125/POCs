using AuthService.DBContext;
using AuthService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Models.RequestModels;
using AuthService.Models.ResponseModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthService.Repo
{
    public class AuthRepo : IAuthRepo
    {
        private readonly AuthDBContext _dBContext;
        private readonly IConfiguration _configuration;

        public AuthRepo(AuthDBContext dBContext, IConfiguration configuration)
        {
            _dBContext = dBContext;
            _configuration = configuration;
        }

        public async Task<LogInRes> Login(LogInReq logInReq)
        {
            var existingUser = await getUser(logInReq.UserName);
            if (existingUser == null)
            {
                return null;
            }
            if (!(existingUser.UserName == logInReq.UserName && existingUser.Password == logInReq.Password))
            {
                return null;
            }

            string token = generateToken(existingUser);
            var logInRes = new LogInRes
            {
                UserName = existingUser.UserName,
                Email = existingUser.Email,
                Role = existingUser.Role,
                Token = token
            };

            return logInRes;
        }

        private string generateToken(User existingUser)
        {
            try
            {
                var secretKey = _configuration.GetSection("JWTToken:Token").Value;
                if (string.IsNullOrEmpty(secretKey))
                {
                    throw new ArgumentNullException("JWT secret key is missing in configuration");
                }
                //var keyBytes = Convert.FromBase64String(secretKey);
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier , value: existingUser.Id.ToString()),
                    new Claim(ClaimTypes.Name, existingUser.UserName ?? string.Empty)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                //var key = new SymmetricSecurityKey(keyBytes);
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var audiences = _configuration.GetSection("JWTToken:Audiences").Get<string[]>();

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = creds,
                    Issuer = _configuration["JWTToken:Issuer"],
                    Audience = audiences?.FirstOrDefault()
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);

                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token creation failed: {ex}");
                throw;
            }
        }

        public async Task<User> Register(Registration registration)
        {
            if (await getUser(registration.UserName) !=null)
            {
                return null;
            }

            var newUser = new User
            {
                UserName = registration.UserName,
                Email = registration.Email,
                Password = registration.Password,
                Role = registration.Role
            };

            _dBContext.Users.Add(newUser);
            await _dBContext.SaveChangesAsync();

            return newUser;
        }

        public async Task<User> getUser(string userName)
        {
            return await _dBContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        }
    }
}
