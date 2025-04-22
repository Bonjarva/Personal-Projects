using Microsoft.EntityFrameworkCore;
using MyBackend.Extensions;       // your service extensions
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

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
    .AddControllers();

// REGISTER health checks **separately**, since it returns IHealthChecksBuilder:
builder.Services.AddHealthChecks();

// ─────────────────────────────────────────────────────────────
// 2) Build pipeline
// ─────────────────────────────────────────────────────────────

var app = builder.Build();

// dev vs prod middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger().UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");  // you’d want an ErrorController
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/error/{0}");


app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

// ─────────────────────────────────────────────────────────────
// 3) Map endpoints
// ─────────────────────────────────────────────────────────────

app.MapControllers();
app.MapHealthChecks("/health");




// ─────────────────────────────────────────────────────────────
// 4) Database migrations on startup
// ─────────────────────────────────────────────────────────────

app.Services.MigrateDatabase();  // small extension below

// ─────────────────────────────────────────────────────────────
// 5) Run
// ─────────────────────────────────────────────────────────────

app.Run();