using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StockSenseAI.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace StockSenseAI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;
    private readonly AppDbContext _context;

    public AuthService(IUserRepository userRepository, IConfiguration config, AppDbContext context)
    {
        _userRepository = userRepository;
        _config = config;
        _context = context;
    }

    public async Task<string?> LoginAsync(string username, string password)
    {
        var user = await _context.Users
            .Include(u => u.Supplier)
            .FirstOrDefaultAsync(u => u.Username == username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        return GenerateJwtToken(user);
    }

    public async Task<bool> RegisterAsync(string username, string password, string? supplierCode = null)
    {
        var existingUser = await _userRepository.GetByUsernameAsync(username);
        if (existingUser != null)
            return false;

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = "User"
        };

        if (string.IsNullOrEmpty(supplierCode))
        {
            // Registering as a new Supplier (Manager)
            var newSupplier = new Supplier
            {
                Name = username + " Company",
                SupplierCode = "SUP-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()
            };

            await _context.Suppliers.AddAsync(newSupplier);
            await _context.SaveChangesAsync(); // Get Supplier ID

            user.SupplierId = newSupplier.Id;
            user.Role = "Supplier";
        }
        else
        {
            // Registering as an Employee joining a Supplier
            var existingSupplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.SupplierCode == supplierCode);
            if (existingSupplier == null)
            {
                throw new Exception("Invalid Supplier Code");
            }

            user.SupplierId = existingSupplier.Id;
            user.Role = "Staff";
            user.EmployeeCode = "EMP-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
        }

        return await _userRepository.CreateAsync(user);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        if (user.SupplierId.HasValue)
        {
            claims.Add(new Claim("SupplierId", user.SupplierId.Value.ToString()));
        }

        if (user.Supplier != null)
        {
            claims.Add(new Claim("SupplierCode", user.Supplier.SupplierCode));
        }

        if (!string.IsNullOrEmpty(user.EmployeeCode))
        {
            claims.Add(new Claim("EmployeeCode", user.EmployeeCode));
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
