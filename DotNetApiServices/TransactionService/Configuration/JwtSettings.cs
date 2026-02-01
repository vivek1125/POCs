using Microsoft.Extensions.Configuration;

namespace TransactionService.Configuration
{
    public class JwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;

        public static JwtSettings LoadFromConfiguration(IConfiguration configuration)
        {
            return new JwtSettings
            {
                Key = configuration["Jwt:Key"] ?? string.Empty,
                Issuer = configuration["Jwt:Issuer"] ?? string.Empty,
                Audience = configuration["Jwt:Audience"] ?? string.Empty
            };
        }
    }
}