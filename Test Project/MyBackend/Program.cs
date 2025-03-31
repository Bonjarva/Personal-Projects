using Microsoft.EntityFrameworkCore;
using MyBackend.Models;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS to allow any origin (for development)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register the DbContext with SQLite
builder.Services.AddDbContext<TaskContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tasks.db"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS using the defined policy
app.UseCors("AllowAll");

// Add the root endpoint that returns a simple message.
app.MapGet("/", () => "Hello from .NET API!");


app.MapGet("/tasks", async (TaskContext db) =>
{
    var tasks = await db.Tasks.ToListAsync();
    return Results.Ok(tasks);
});

app.MapPost("/tasks", async (TaskItem task, TaskContext db) =>
{
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

// (Optional) Add a PUT endpoint to update a task:
app.MapPut("/tasks/{id}", async (int id, TaskItem updatedTask, TaskContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    task.Title = updatedTask.Title;
    task.IsCompleted = updatedTask.IsCompleted;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// (Optional) Add a DELETE endpoint to remove a task:
app.MapDelete("/tasks/{id}", async (int id, TaskContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();