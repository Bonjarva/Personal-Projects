using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MyBackend.Models;  // This namespace should contain ApplicationDbContext
using Microsoft.AspNetCore.Identity;

// ===================================================
// Build the WebApplication Builder
// ===================================================
var builder = WebApplication.CreateBuilder(args);

// ===================================================
// 1. Configure Services
// ===================================================

// 1.1. Configure the Connection String and DbContext
// Use the connection string from configuration or default to a local SQLite file.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));


// 1.2. Add Identity Services
// This registers ASP.NET Core Identity and configures EF Core stores.
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// 1.3. Configure JWT Authentication
// Retrieve the JWT key from configuration or use a fallback value (for demo purposes only).
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MySuperSecretKeyThatIsAtLeast16CharsLong";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // In production, set to true and provide valid values.
        ValidateAudience = false, // In production, set to true and provide valid values.
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();

// 1.4. Configure CORS (for development purposes)
// Allow any origin; in production, restrict this as necessary.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 1.5. Add Swagger for API documentation (optional, for development)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();




// ===================================================
// Build the Application
// ===================================================
var app = builder.Build();




// ===================================================
// 2. Configure Middleware
// ===================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();


// ===================================================
// 3. Define Endpoints
// ===================================================


app.MapControllers();


// 3.3. un Protected Root Endpoint
// This endpoint doesnt require a valid JWT token.
app.MapGet("/", () => "Woohoo it worked");


// 3.4. Protected Tasks Endpoints



// GET /tasks - Retrieve all tasks
app.MapGet("/tasks", async (ApplicationDbContext db) =>
{
    var tasks = await db.Tasks.ToListAsync();
    return Results.Ok(tasks);
})
.RequireAuthorization();




// POST /tasks - Create a new task
app.MapPost("/tasks", async (TaskItem task, ApplicationDbContext db) =>
{
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
})
.RequireAuthorization();




// PUT /tasks/{id} - Update an existing task
app.MapPut("/tasks/{id}", async (int id, TaskItem updatedTask, ApplicationDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null)
        return Results.NotFound();
    task.Title = updatedTask.Title;
    task.IsCompleted = updatedTask.IsCompleted;
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();





// DELETE /tasks/{id} - Delete a task
app.MapDelete("/tasks/{id}", async (int id, ApplicationDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null)
        return Results.NotFound();
    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();


// Ensure the database is created and all migrations are applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}



// ===================================================
// 4. Run the Application
// ===================================================
app.Run();