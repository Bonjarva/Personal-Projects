using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using MyBackend.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyBackend.Extensions
{
    public static class ServiceExtensions
{
    public static IServiceCollection AddIdentityStores(this IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, IdentityRole>()
                    .AddEntityFrameworkStores<ApplicationDbContext>()
                    .AddDefaultTokenProviders();
            return services;
        }
  public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration cfg)
  {
    var cs = cfg.GetConnectionString("DefaultConnection")
             ?? "Data Source=app.db";
    services.AddDbContext<ApplicationDbContext>(o => o.UseSqlite(cs));
    return services;
  }

public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration cfg)
{
    // grab your secret from config (or fallback for dev/demo)
    var key = cfg["Jwt:Key"]!;
    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

    services
      .AddAuthentication(options =>
      {
          options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
          options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
      })
      .AddJwtBearer(options =>
      {
          options.TokenValidationParameters = new TokenValidationParameters
          {
              ValidateIssuer           = false,  // turn on and configure for production
              ValidateAudience         = false,  // turn on and configure for production
              ValidateLifetime         = true,
              ValidateIssuerSigningKey = true,
              IssuerSigningKey         = signingKey
          };

          // these events let you see in the console why a token was accepted or rejected
          options.Events = new JwtBearerEvents
          {
              OnAuthenticationFailed = ctx =>
              {
                  Console.Error.WriteLine($"🔒 JWT auth FAILED: {ctx.Exception?.Message}");
                  return Task.CompletedTask;
              },
              OnTokenValidated = ctx =>
              {
                  Console.WriteLine($"✅ JWT validated for user “{ctx.Principal?.Identity?.Name}”");
                  return Task.CompletedTask;
              }
          };
      });

    services.AddAuthorization();
    return services;
}

public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration config)
{
    // Load any fixed origins you still want to allow from config
    var configuredOrigins = config
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() 
        ?? throw new InvalidOperationException("Cors:AllowedOrigins missing");

    services.AddCors(opts =>
    {
        opts.AddPolicy("Frontend", policy =>
            policy
              // Allow the explicit ones too
              .WithOrigins(configuredOrigins)
              
              // wildcard localhost (any port, any scheme)
              .SetIsOriginAllowed(origin =>
              {
                  if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                  {
                      // allow anything on localhost
                      if (uri.Host == "localhost" || uri.Host == "127.0.0.1")
                          return true;

                      // allow any vercel.app subdomain
                      if (uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                          return true;
                  }
                  return false;
              })
              
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
        );
    });

    return services;
}

  public static IServiceCollection AddSwaggerDev(this IServiceCollection services, IWebHostEnvironment env)
  {
    if (env.IsDevelopment())
      services.AddEndpointsApiExplorer()
              .AddSwaggerGen();
    return services;
  }

  public static IServiceCollection AddCookiePolicyForApi(this IServiceCollection services)
        {
            services.ConfigureApplicationCookie(options =>
            {
                options.Events = new CookieAuthenticationEvents
                {
                    OnRedirectToLogin = context =>
                    {
                        if (context.Request.Path.StartsWithSegments("/api") ||
                            context.Request.Path.StartsWithSegments("/tasks"))
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            return Task.CompletedTask;
                        }
                        context.Response.Redirect(context.RedirectUri);
                        return Task.CompletedTask;
                    },
                    OnRedirectToAccessDenied = context =>
                    {
                        if (context.Request.Path.StartsWithSegments("/api") ||
                            context.Request.Path.StartsWithSegments("/tasks"))
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            return Task.CompletedTask;
                        }
                        context.Response.Redirect(context.RedirectUri);
                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }
        public static IHost MigrateDatabase(this IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.Migrate();
            return services.GetRequiredService<IHost>(); 
        }



public static IServiceCollection AddCustomJsonOptions(this IServiceCollection services)
        {
            // If you use controllers:
            services
                .AddControllers()
                .AddJsonOptions(opts =>
                {
                    opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                    opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                    opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    #if DEBUG
                    opts.JsonSerializerOptions.WriteIndented = true;
                    #endif
                });

            return services;
        }


}
}

