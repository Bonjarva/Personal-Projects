using Microsoft.EntityFrameworkCore;
using MyBackend.Models;  // This namespace should contain ApplicationDbContext
using MyBackend.Extensions;

// ===================================================
// Build the WebApplication Builder
// ===================================================
var builder = WebApplication.CreateBuilder(args);

builder.Services
       .AddDatabase(builder.Configuration)
       .AddIdentityStores()
       .AddCookiePolicyForApi()
       .AddJwtAuth(builder.Configuration)
       .AddCorsDev()
       .AddSwaggerDev(builder.Environment)
       .AddControllers();

var app = builder.Build();

// swagger only in dev
if (app.Environment.IsDevelopment())
  app.UseSwagger().UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Map all [ApiController] endpoints:
app.MapControllers();




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