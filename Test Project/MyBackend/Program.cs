using Microsoft.EntityFrameworkCore;
using MyBackend.Extensions;       // your service extensions
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using MyBackend.Extensions.Middleware;
using MyBackend.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────
// 1) Configure Services
// ─────────────────────────────────────────────────────────────

builder.Services
    .AddDatabase(builder.Configuration)          // DbContext + SQLite
    .AddIdentityStores()                          // ASP.NET Identity
    .AddCookiePolicyForApi()                      // no‐redirect for API
    .AddJwtAuth(builder.Configuration)            // JWT‐Bearer
    .AddCorsPolicy(builder.Configuration)                                 // AllowAll CORS in dev
    .AddSwaggerDev(builder.Environment)           // Swagger in dev
    .AddCustomJsonOptions(); // Includes AddControllers + JSON setup

builder.Services
  .AddHealthChecks()
  .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live" })
  .AddDbContextCheck<ApplicationDbContext>(   // checks EF Core can open a connection
     name: "sqlite",
     failureStatus: HealthStatus.Unhealthy,
     tags: new[] { "db", "ready" });

// ─────────────────────────────────────────────────────────────
// 2) Build pipeline
// ─────────────────────────────────────────────────────────────

var app = builder.Build();

// API‑only JSON exception handler
app.UseWhen(
  ctx => ctx.Request.Path.StartsWithSegments("/api"),
  branch => branch.UseMiddleware<GlobalExceptionHandlerMiddleware>()
);

// dev vs prod middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger().UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");  // you’d want an ErrorController
    app.UseHsts();
    app.UseStatusCodePagesWithReExecute("/error/{0}");
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

// ─────────────────────────────────────────────────────────────
// 3) Map endpoints
// ─────────────────────────────────────────────────────────────

app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions{});

// Liveness: just “is this process up?”
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// Readiness: “are my critical dependencies up?”
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    // return 503 if any are unhealthy
    ResultStatusCodes =
    {
        [HealthStatus.Healthy] = StatusCodes.Status200OK,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable,
        [HealthStatus.Degraded] = StatusCodes.Status200OK
    }
});




// ─────────────────────────────────────────────────────────────
// 4) Database migrations on startup
// ─────────────────────────────────────────────────────────────

app.Services.MigrateDatabase();  // small extension below

// ─────────────────────────────────────────────────────────────
// 5) Run
// ─────────────────────────────────────────────────────────────

app.Run();