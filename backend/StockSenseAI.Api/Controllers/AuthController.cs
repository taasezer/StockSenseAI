using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> Register([FromBody] LoginDto loginDto)
    {
        var result = await _authService.RegisterAsync(loginDto.Username, loginDto.Password);
        return result ? Ok("User registered successfully") : BadRequest("Registration failed");
    }
}
