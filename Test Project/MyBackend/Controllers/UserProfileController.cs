using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MyBackend.Models;

namespace MyBackend.Controllers{

    [ApiController]
[Route("api/user")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _env;
    public UserProfileController(UserManager<ApplicationUser> userManager, IWebHostEnvironment env)
    {
        _userManager = userManager;
        _env = env;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        return Ok(new {
            user.Id,
            user.UserName,
            user.Email,
            user.Name,
            user.AvatarUrl,
            user.TimeZone,
            Preferences = string.IsNullOrEmpty(user.PreferencesJson)
                ? new { }
                : JsonSerializer.Deserialize<object>(user.PreferencesJson)
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        user.Name = dto.Name ?? user.Name;
        user.TimeZone = dto.TimeZone ?? user.TimeZone;
        if (!string.IsNullOrEmpty(dto.PreferencesJson))
            user.PreferencesJson = dto.PreferencesJson;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return NoContent();
    }

    // DTOs below
    public record ProfileUpdateDto(string? Name, string? TimeZone, string? PreferencesJson);
}

}