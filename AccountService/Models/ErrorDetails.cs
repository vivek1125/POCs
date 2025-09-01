using System.Text.Json;

namespace AccountService.Models
{
    public class ErrorDetails
    {
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public string ErrorType { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? StackTrace { get; set; }
        public IDictionary<string, string[]>? ValidationErrors { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}