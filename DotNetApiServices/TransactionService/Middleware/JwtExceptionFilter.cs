using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.Net;

namespace TransactionService.Middleware
{
    public class JwtExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<JwtExceptionFilter> _logger;

        public JwtExceptionFilter(ILogger<JwtExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            if (context.Exception is SecurityTokenException)
            {
                _logger.LogWarning("JWT Validation Error: {Message}", context.Exception.Message);
                context.Result = new UnauthorizedObjectResult(new
                {
                    Status = HttpStatusCode.Unauthorized,
                    Message = "Invalid or expired token"
                });
                context.ExceptionHandled = true;
            }
        }
    }
}