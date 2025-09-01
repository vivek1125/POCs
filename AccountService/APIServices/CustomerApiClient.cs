using AccountService.Models;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AccountService.APIServices
{
    public class CustomerApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CustomerApiClient(HttpClient httpClient, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _httpClient.BaseAddress = new Uri(_configuration["Services:CustomerService"] ?? 
                throw new InvalidOperationException("CustomerService URL not configured"));
        }

        public async Task<Customer?> GetCustomerAsync(int customerId)
        {
            // Forward the authorization token
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"]
                .FirstOrDefault()?.Split(" ").Last();
            
            if (token != null)
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync($"api/Customer/GetCustomer?id={customerId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<Customer>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
            }

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            throw new HttpRequestException($"Error getting customer: {response.StatusCode}");
        }
    }
}