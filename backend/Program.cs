
using JensenOnline.API.Data;
using JensenOnline.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register database

// Always use the same SQLite database file
var databasePath = Path.Combine(
    builder.Environment.ContentRootPath,
    "jensenonline.db"
);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath}")
);


// Configure Identity
builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>(options =>
    {
        // Password requirements
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;

        // Account lockout
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        // Unique email addresses
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add controllers
builder.Services.AddControllersWithViews();

// Authorization
builder.Services.AddAuthorization();

// Configure CSRF protection
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";

    options.Cookie.Name = "JensenOnline.Antiforgery";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;

    // False only because our current local POC uses HTTP.
    // Change to Always when HTTPS is configured.
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// Configure authentication cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;

    // Local HTTP development only.
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    // Return API status codes instead of HTML redirects.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});



var app = builder.Build();

// Create database roles on startup.

// Apply database migrations and create roles on startup.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    // Get database context
    var dbContext = services
        .GetRequiredService<ApplicationDbContext>();

    // Apply pending migrations before using the database
    await dbContext.Database.MigrateAsync();

    // Create Admin and Customer roles
    await RoleSeeder.SeedRolesAsync(services);
    
    await ProductSeeder.SeedProductsAsync(services);

}



// HTTPS redirection
// app.UseHttpsRedirection();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Identity endpoints
// app.MapGroup("/api/auth")
//    .MapIdentityApi<ApplicationUser>();

// Map controllers
app.MapControllers();

app.Run();
