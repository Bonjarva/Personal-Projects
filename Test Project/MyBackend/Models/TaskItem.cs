using System.ComponentModel.DataAnnotations;

namespace MyBackend.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }
    }
}
