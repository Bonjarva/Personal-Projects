using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MyBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class HealthController : ControllerBase
  {
    private readonly HealthCheckService _hcService;

    public HealthController(HealthCheckService hcService)
    {
      _hcService = hcService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
      var report = await _hcService.CheckHealthAsync();

      // 200 if all healthy, otherwise 503
      var statusCode = report.Status == HealthStatus.Healthy
        ? 200
        : StatusCodes.Status503ServiceUnavailable;

      return StatusCode(statusCode, new
      {
        status = report.Status.ToString(),
        results = report.Entries.ToDictionary(
          e => e.Key,
          e => new {
            status = e.Value.Status.ToString(),
            description = e.Value.Description
          })
      });
    }
  }
}
