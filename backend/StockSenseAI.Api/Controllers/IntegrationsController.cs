using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly IIntegrationService _integrationService;

    public IntegrationsController(IIntegrationService integrationService)
    {
        _integrationService = integrationService;
    }

    #region Dashboard

    /// <summary>
    /// Get integration dashboard with stats and recent activity
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard = await _integrationService.GetDashboardAsync();
        return Ok(dashboard);
    }

    #endregion

    #region Webhooks

    [HttpGet("webhooks")]
    public async Task<IActionResult> GetAllWebhooks()
    {
        var webhooks = await _integrationService.GetAllWebhooksAsync();
        return Ok(webhooks);
    }

    [HttpGet("webhooks/{id}")]
    public async Task<IActionResult> GetWebhook(int id)
    {
        var webhook = await _integrationService.GetWebhookByIdAsync(id);
        return webhook == null ? NotFound() : Ok(webhook);
    }

    [HttpPost("webhooks")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateWebhook([FromBody] WebhookConfigDto dto)
    {
        var webhook = await _integrationService.CreateWebhookAsync(dto);
        return CreatedAtAction(nameof(GetWebhook), new { id = webhook.Id }, webhook);
    }

    [HttpPut("webhooks/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateWebhook(int id, [FromBody] WebhookConfigDto dto)
    {
        var webhook = await _integrationService.UpdateWebhookAsync(id, dto);
        return webhook == null ? NotFound() : Ok(webhook);
    }

    [HttpDelete("webhooks/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteWebhook(int id)
    {
        var result = await _integrationService.DeleteWebhookAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpPost("webhooks/{id}/test")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> TestWebhook(int id)
    {
        var success = await _integrationService.TestWebhookAsync(id);
        return Ok(new { success, message = success ? "Webhook test successful" : "Webhook test failed" });
    }

    #endregion

    #region Webhook Logs

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int? webhookId, [FromQuery] int limit = 50)
    {
        var logs = await _integrationService.GetWebhookLogsAsync(webhookId, limit);
        return Ok(logs);
    }

    #endregion

    #region External Orders

    /// <summary>
    /// Receive incoming order from external platform (public endpoint for webhooks)
    /// </summary>
    [HttpPost("orders/incoming")]
    [AllowAnonymous]
    public async Task<IActionResult> ReceiveOrder([FromBody] IncomingOrderDto dto)
    {
        var order = await _integrationService.ProcessIncomingOrderAsync(dto);
        return Ok(order);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] string? status = null)
    {
        var orders = await _integrationService.GetExternalOrdersAsync(status);
        return Ok(orders);
    }

    [HttpPatch("orders/{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _integrationService.UpdateOrderStatusAsync(id, request.Status);
        return order == null ? NotFound() : Ok(order);
    }

    #endregion
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
