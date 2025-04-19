using Microsoft.AspNetCore.Mvc;

namespace MyBackend.Controllers
{
  [ApiController]
  [Route("/")]
  public class HealthController : ControllerBase
  {
    [HttpGet]
    public IActionResult Get() => Ok("Root endpoint functioning");
  }
}
