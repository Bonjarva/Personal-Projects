using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MyBackend.Models;    // UserRegister, UserLogin
using Microsoft.Extensions.Logging;

namespace MyBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _users;
        private readonly IConfiguration        _config;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<IdentityUser> users,
            IConfiguration config,
            ILogger<AuthController> logger)
        {
            _users  = users;
            _config = config;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegister model)
        {
            try
            {
                var user = new IdentityUser
                {
                    UserName = model.Username,
                    Email    = model.Email
                };

                var result = await _users.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                    {
                        var descriptions = result.Errors.Select(e => e.Description).ToArray();
                        _logger.LogWarning("Registration failed: {Errors}", descriptions);
                        return BadRequest(new { errors = descriptions });
                    }

                return Ok("User registered successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration Error for {Username}", model.Username);
                return Problem(
                    title:  "Registration Exception",
                    detail: ex.ToString(),
                    statusCode: 500
                );
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLogin login)
        {
            if (string.IsNullOrWhiteSpace(login.Username) ||
                string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest("Username and password must be provided.");
            }

            var user = await _users.FindByNameAsync(login.Username);
            if (user is null ||
                !await _users.CheckPasswordAsync(user, login.Password))
            {
                return Unauthorized();
            }

            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            return Problem(
                title: "Configuration Error",
                detail: "JWT Key is not configured.",
                statusCode: 500
            );
            var creds  = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
              claims: new[]
              {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name,           user.UserName!)
              },
              expires: DateTime.UtcNow.AddHours(1),
              signingCredentials: creds
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}
