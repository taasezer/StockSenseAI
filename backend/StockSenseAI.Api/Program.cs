using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StockSenseAI.Api.Hubs;
using StockSenseAI.Infrastructure;
using StockSenseAI.Infrastructure.Repositories;
using StockSenseAI.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "StockSenseAI API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        In = ParameterLocation.Header,
        Description = "Enter JWT Token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// SignalR
builder.Services.AddSignalR();
builder.Services.AddResponseCompression();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// ---------------------------------
// YENİ GÜVENLİ CORS AYARI
// ---------------------------------
builder.Services.AddCors(options => {
    options.AddPolicy("AllowVercelFrontend", policy => {
        
        // Bu "FRONTEND_URL" değişkenini Render'ın Environment sekmesinden ekleyeceğiz
        var frontendURL = builder.Configuration["FRONTEND_URL"];
        
        if (string.IsNullOrEmpty(frontendURL))
        {
            // Eğer değişken bulunamazsa (örn: local development), esnek davran
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // Production ortamında (Render):
            // Sadece Vercel adresinden gelen isteklere izin ver
            policy.WithOrigins(frontendURL) 
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Auth ve SignalR için bu gerekli
        }
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ---------------------------------
// YENİ POLICY'Yİ UYGULA
// ---------------------------------
app.UseCors("AllowVercelFrontend"); // "AllowAll" yerine bunu kullan

app.UseAuthentication();
app.UseAuthorization();
app.UseResponseCompression();
app.MapControllers();
app.MapHub<ProductHub>("/productHub");

app.Run();