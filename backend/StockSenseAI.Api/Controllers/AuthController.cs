using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Services;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var token = await _authService.LoginAsync(loginDto.Username, loginDto.Password);
        return token == null ? Unauthorized() : Ok(new { Token = token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try {
            var result = await _authService.RegisterAsync(dto.Username, dto.Password, dto.SupplierCode, dto.Email, dto.PhoneNumber, dto.Address);
            return result ? Ok("User registered successfully") : BadRequest("Registration failed");
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var supplierId = User.FindFirstValue("SupplierId");
        var supplierCode = User.FindFirstValue("SupplierCode");
        var employeeCode = User.FindFirstValue("EmployeeCode");
        
        return Ok(new {
            Username = username,
            Role = role,
            SupplierId = supplierId,
            SupplierCode = supplierCode,
            EmployeeCode = employeeCode
        });
    }
}
