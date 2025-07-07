using AccountService.Models;
using System.Text.Json;

namespace AccountService.ApiServices
{
    public class CustomerApiClient : ICustomerApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public CustomerApiClient(HttpClient httpClient,IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }
        public async Task<Customer?> GetCustomerAsync(int customerId)
        {
            var response = await _httpClient.GetAsync($"/api/Customer/GetCustomer?id={customerId}");
            if (!response.IsSuccessStatusCode) return null;
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Customer>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}
