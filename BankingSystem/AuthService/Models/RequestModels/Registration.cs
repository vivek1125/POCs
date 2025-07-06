namespace AuthService.Models.RequestModels
{
    public class Registration
    {
        public string UserName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public UserRole Role { get; set; }
    }
}
