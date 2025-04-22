using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyBackend.Models;    // ApplicationDbContext, TaskItem

namespace MyBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]                      // Require a valid JWT for all actions
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public TasksController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _db.Tasks.ToListAsync();
            return Ok(tasks);
        }

        // POST api/tasks
        [HttpPost]
        public async Task<IActionResult> Create(TaskItem task)
        {
            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }

        // GET api/tasks/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _db.Tasks.FindAsync(id);
            return task is null ? NotFound() : Ok(task);
        }

        // PUT api/tasks/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TaskItem updated)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task is null) return NotFound();

            task.Title        = updated.Title;
            task.IsCompleted  = updated.IsCompleted;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/tasks/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task is null) return NotFound();

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
