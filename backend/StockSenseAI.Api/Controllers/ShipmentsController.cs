using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipmentsController : ControllerBase
{
    private readonly IShipmentService _shipmentService;

    public ShipmentsController(IShipmentService shipmentService)
    {
        _shipmentService = shipmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var shipments = await _shipmentService.GetAllAsync();
        return Ok(shipments);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var shipments = await _shipmentService.GetPendingAsync();
        return Ok(shipments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var shipment = await _shipmentService.GetByIdAsync(id);
        return shipment == null ? NotFound() : Ok(shipment);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] ShipmentDto dto)
    {
        var shipment = await _shipmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = shipment.Id }, shipment);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var shipment = await _shipmentService.UpdateStatusAsync(id, dto.Status);
        return shipment == null ? NotFound() : Ok(shipment);
    }

    [HttpPost("{id}/deliver")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> MarkAsDelivered(int id)
    {
        var shipment = await _shipmentService.MarkAsDeliveredAsync(id);
        return shipment == null ? NotFound() : Ok(shipment);
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await _shipmentService.CancelAsync(id);
        return result ? NoContent() : NotFound();
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
