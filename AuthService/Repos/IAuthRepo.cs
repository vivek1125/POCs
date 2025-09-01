using AuthService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Repos
{
    public interface IAuthRepo
    {
        Task<User?> AuthenticateAsync(string userName, string password);
        Task<User?> RegisterAsync(string userName, string email, string password, string role);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<List<User>> GetAllUsersAsync();
    }
}