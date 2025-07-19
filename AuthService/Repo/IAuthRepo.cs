using AuthService.Models;
using AuthService.Models.RequestModels;
using AuthService.Models.ResponseModels;

namespace AuthService.Repo
{
    public interface IAuthRepo
    {
        Task<User> Register(Registration registration);
        Task<LogInRes> Login(LogInReq logInReq);
        Task<User> GetUser(string userName);
    }
}
