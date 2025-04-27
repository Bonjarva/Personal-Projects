using System.ComponentModel.DataAnnotations;

namespace MyBackend.Models
{
    public record UserLogin(
        [Required, StringLength(50, MinimumLength = 3)]
        string Username,

        [Required, StringLength(100, MinimumLength = 6)]
        string Password
    );
}
