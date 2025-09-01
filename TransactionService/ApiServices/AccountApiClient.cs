using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using TransactionService.Models;

namespace TransactionService.APIServices
{
    public class AccountApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AccountApiClient(HttpClient httpClient, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<bool> UpdateBalanceAsync(int accountNumber, decimal newBalance, DateTime updateTime)
        {
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.Replace("Bearer ", ""));
            }

            var response = await _httpClient.PutAsJsonAsync(
                $"api/account/UpdateBalance?accountNumber={accountNumber}",
                new { newBalance = newBalance, balanceUpdateOn = updateTime });

            return response.IsSuccessStatusCode;
        }

        public async Task<decimal> GetBalanceAsync(int accountNumber)
        {
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.Replace("Bearer ", ""));
            }

            var response = await _httpClient.GetAsync($"api/account/GetAccountByAccountNumber?accountNumber={accountNumber}");

            if (response.IsSuccessStatusCode)
            {
                var account = await response.Content.ReadFromJsonAsync<Account>();
                return account?.AccountBalance ?? 0;
            }

            throw new HttpRequestException($"Failed to get account balance. Status: {response.StatusCode}");
        }
    }
}