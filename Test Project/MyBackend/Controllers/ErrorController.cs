// Controllers/ErrorController.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MyBackend.Controllers
{
    [ApiController]
    [Route("error")]
    public class ErrorController : ControllerBase
    {
        private readonly ILogger<ErrorController> _logger;
        public ErrorController(ILogger<ErrorController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Catches unhandled exceptions
        /// </summary>
        [Route("")]
        public IActionResult HandleException()
        {
            var feature = HttpContext.Features.Get<IExceptionHandlerFeature>();
            var ex      = feature?.Error;

            // Log the full exception
            if (ex != null) _logger.LogError(ex, "Unhandled exception");

            // Return a ProblemDetails JSON response
            var problem = new ProblemDetails
            {
                Title       = "An unexpected error occurred.",
                Detail      = ex?.Message,
                Status      = StatusCodes.Status500InternalServerError,
                Instance    = HttpContext.Request.Path
            };
            return StatusCode(500, problem);
        }

        /// <summary>
        /// Handles non‑exception status codes (404, 401, etc.)
        /// </summary>
        [Route("{code:int}")]
        public IActionResult HandleStatusCode(int code)
        {
            // You could customize each code here
            var problem = new ProblemDetails
            {
                Title    = code switch
                {
                    404 => "Resource not found.",
                    401 => "Unauthorized.",
                    403 => "Forbidden.",
                    _   => $"HTTP {code}"
                },
                Status   = code,
                Instance = HttpContext.Request.Path
            };
            return StatusCode(code, problem);
        }
    }
}
