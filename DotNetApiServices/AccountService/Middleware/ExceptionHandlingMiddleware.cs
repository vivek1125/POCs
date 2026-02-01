using AccountService.Exceptions;
using AccountService.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace AccountService.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var errorDetails = new ErrorDetails
            {
                Message = GetUserFriendlyMessage(exception),
                StatusCode = (int)GetStatusCode(exception),
                ErrorType = exception.GetType().Name,
                Path = context.Request.Path,
                Timestamp = DateTime.UtcNow
            };

            // Include stack trace only in development
            if (_env.IsDevelopment())
            {
                errorDetails.StackTrace = exception.StackTrace;
            }

            // Handle validation errors
            if (exception is ValidationException validationEx)
            {
                var validationErrors = new Dictionary<string, string[]>();
                foreach (var error in validationEx.Errors)
                {
                    validationErrors[error.Key] = new[] { error.Value };
                }
                errorDetails.ValidationErrors = validationErrors;
            }

            context.Response.StatusCode = errorDetails.StatusCode;

            var result = JsonSerializer.Serialize(errorDetails, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
            
            await context.Response.WriteAsync(result);
        }

        private static HttpStatusCode GetStatusCode(Exception exception)
        {
            return exception switch
            {
                AccountNotFoundException => HttpStatusCode.NotFound,
                AccountValidationException => HttpStatusCode.BadRequest,
                InactiveAccountException => HttpStatusCode.BadRequest,
                InvalidBalanceException => HttpStatusCode.BadRequest,
                CustomerValidationFailedException => HttpStatusCode.BadRequest,
                ValidationException => HttpStatusCode.BadRequest,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                HttpRequestException => HttpStatusCode.ServiceUnavailable,
                _ => HttpStatusCode.InternalServerError
            };
        }

        private static string GetUserFriendlyMessage(Exception exception)
        {
            // Return the exception message for known exceptions
            if (exception is AccountNotFoundException ||
                exception is AccountValidationException ||
                exception is InactiveAccountException ||
                exception is InvalidBalanceException ||
                exception is CustomerValidationFailedException)
            {
                return exception.Message;
            }

            // Return a generic message for unknown exceptions
            return "An error occurred while processing your request.";
        }
    }

    // Extension method to make registration cleaner
    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomExceptionHandler(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }

    // Custom validation exception
    public class ValidationException : Exception
    {
        public Dictionary<string, string> Errors { get; }

        public ValidationException() : base("One or more validation errors occurred.")
        {
            Errors = new Dictionary<string, string>();
        }

        public ValidationException(Dictionary<string, string> errors) : this()
        {
            Errors = errors;
        }
    }
}