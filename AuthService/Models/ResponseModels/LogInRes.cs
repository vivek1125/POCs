namespace AuthService.Models.ResponseModels
{
    public class LogInRes
    {
        public string UserName { get; set; }

        public string Email { get; set; }

        public UserRole Role { get; set; }

        public string Token { get; set; }
    }
}
