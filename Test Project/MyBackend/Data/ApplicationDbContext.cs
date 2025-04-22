using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MyBackend.Models
{
    // ApplicationDbContext now inherits from IdentityDbContext,
    // which provides the Identity tables along with your custom tables.
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Add your application-specific DbSet(s) here:
        public DbSet<TaskItem> Tasks { get; set; }
    }

        // Your TaskItem model definition
        public class TaskItem
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public bool IsCompleted { get; set; }
    }
}
