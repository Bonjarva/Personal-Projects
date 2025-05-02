using Microsoft.AspNetCore.Identity;

namespace MyBackend.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Extend with whatever you need:
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
        public string? TimeZone { get; set; }

        // You can also add a JSON column for misc. prefs:
        public string? PreferencesJson { get; set; }
    }
}
