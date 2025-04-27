using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace MyBackend.Extensions.Middleware
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionHandlerMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlerMiddleware> logger,
            IWebHostEnvironment env)
        {
            _next   = next;
            _logger = logger;
            _env    = env;
        }

        public async Task InvokeAsync(HttpContext http)
        {
            try
            {
                await _next(http);
            }
            catch (Exception ex)
            {
                // 1) Log the full exception
                var traceId = Activity.Current?.Id ?? http.TraceIdentifier;
                _logger.LogError(ex, "Unhandled exception (TraceId: {TraceId})", traceId);

                // 2) Clear any existing response
                http.Response.Clear();
                http.Response.ContentType = "application/problem+json";
                http.Response.StatusCode  = StatusCodes.Status500InternalServerError;

                // 3) Build a ProblemDetails
                var problem = new ProblemDetails
                {
                    Type     = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                    Title    = "An unexpected error occurred!",
                    Status   = StatusCodes.Status500InternalServerError,
                    Detail   = _env.IsDevelopment() ? ex.ToString() : "Internal Server Error",
                    Instance = http.Request.Path
                };
                problem.Extensions["traceId"] = traceId;

                // 4) Serialize to the response
                await http.Response.WriteAsJsonAsync(problem);
            }
        }
    }
}
