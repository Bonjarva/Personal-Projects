using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
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


// 3.1. Registration Endpoint (Public)
// Allows new users to register with a username, email, and password.
app.MapPost("/register", async (UserRegister model, UserManager<IdentityUser> userManager) =>
{
    var user = new IdentityUser { UserName = model.Username, Email = model.Email };
    var result = await userManager.CreateAsync(user, model.Password);
    if (result.Succeeded)
    {
        return Results.Ok("User registered successfully.");
    }
    return Results.BadRequest(result.Errors);
});


// 3.2. Login Endpoint (Public)
// Validates user credentials and issues a JWT token on success.
app.MapPost("/login", async (UserLogin login, UserManager<IdentityUser> userManager) =>
{
    var user = await userManager.FindByNameAsync(login.Username);
    if (user != null && await userManager.CheckPasswordAsync(user, login.Password))
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);
        return Results.Ok(new { token = tokenString });
    }
    return Results.Unauthorized();
});


// 3.3. Protected Root Endpoint
// This endpoint requires a valid JWT token.
app.MapGet("/", () => "Hello from .NET API!")
   .RequireAuthorization();


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



// ===================================================
// 4. Run the Application
// ===================================================
app.Run();

// ===================================================
// Data Transfer Objects (DTOs)
// ===================================================
record UserRegister(string Username, string Email, string Password);
record UserLogin(string Username, string Password);