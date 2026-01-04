using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;
using System.Security.Claims;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    /// <summary>
    /// Get alert summary with counts and top alerts
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _alertService.GetAlertSummaryAsync();
        return Ok(summary);
    }

    /// <summary>
    /// Get all products with low stock
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockProducts()
    {
        var products = await _alertService.GetLowStockProductsAsync();
        return Ok(products);
    }

    /// <summary>
    /// Get all active (unresolved) alerts
    /// </summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveAlerts()
    {
        var alerts = await _alertService.GetActiveAlertsAsync();
        return Ok(alerts);
    }

    /// <summary>
    /// Manually trigger alert check
    /// </summary>
    [HttpPost("check")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CheckAlerts()
    {
        await _alertService.CheckAndCreateAlertsAsync();
        return Ok(new { message = "Alert check completed" });
    }

    /// <summary>
    /// Get user's alert settings
    /// </summary>
    [HttpGet("settings")]
    [Authorize]
    public async Task<IActionResult> GetSettings()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var settings = await _alertService.GetAlertSettingsAsync(userId.Value);
        return settings == null 
            ? Ok(new AlertSettingsDto()) 
            : Ok(settings);
    }

    /// <summary>
    /// Update user's alert settings
    /// </summary>
    [HttpPut("settings")]
    [Authorize]
    public async Task<IActionResult> UpdateSettings([FromBody] AlertSettingsDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var settings = await _alertService.UpdateAlertSettingsAsync(userId.Value, dto);
        return Ok(settings);
    }

    /// <summary>
    /// Mark an alert as read
    /// </summary>
    [HttpPatch("{id}/read")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        await _alertService.MarkAlertAsReadAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Resolve an alert
    /// </summary>
    [HttpPatch("{id}/resolve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ResolveAlert(int id)
    {
        await _alertService.ResolveAlertAsync(id);
        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var id) ? id : null;
    }
}
