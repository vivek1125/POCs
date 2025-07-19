using TransactionService.Models;
using System.Text.Json;
using Microsoft.Identity.Client;

namespace TransactionService.ApiServices
{
    public class AccountApiClient : IAccountApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public AccountApiClient(HttpClient httpClient,IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task SetJwtToken(string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);
        }

        public async Task<Account?> GetAccountDetailsAsync(int acountId)
        {
            var response = await _httpClient.GetAsync($"/api/Account/GetAccountByNumber/getAccount?accountNumber={acountId}");
            if (!response.IsSuccessStatusCode) return null;
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Account>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        public async Task<Account?> UpdateAccountAmountAsync(int accNum, decimal amount, DateTime updatedOn)
        {
            string url = $"/api/Account/UpdateBalance?accountNumber={accNum}&balance={amount}&updatedOn={updatedOn}";
            var response = await _httpClient.PatchAsync(url,null);
            if (!response.IsSuccessStatusCode) return null;
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Account>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}
