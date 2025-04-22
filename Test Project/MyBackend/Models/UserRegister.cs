namespace MyBackend.Models
{
    public record UserRegister(
        string Username,
        string Email,
        string Password
    );
}
