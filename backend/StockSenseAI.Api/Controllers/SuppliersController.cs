using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var suppliers = await _supplierService.GetAllAsync();
        return Ok(suppliers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var supplier = await _supplierService.GetByIdAsync(id);
        return supplier == null ? NotFound() : Ok(supplier);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] SupplierDto dto)
    {
        var supplier = await _supplierService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] SupplierDto dto)
    {
        var supplier = await _supplierService.UpdateAsync(id, dto);
        return supplier == null ? NotFound() : Ok(supplier);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _supplierService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("{id}/shipments")]
    public async Task<IActionResult> GetShipments(int id)
    {
        var shipments = await _supplierService.GetSupplierShipmentsAsync(id);
        return Ok(shipments);
    }

    [HttpPost("{id}/message")]
    public async Task<IActionResult> SendMessage(int id, [FromBody] SendMessageDto dto, [FromServices] StockSenseAI.Infrastructure.AppDbContext dbContext, [FromServices] INotificationService notificationService, [FromServices] ICurrentUserService currentUserService)
    {
        var senderSupplierId = currentUserService.SupplierId;
        var senderSupplier = await dbContext.Suppliers.FindAsync(senderSupplierId);
        var senderName = senderSupplier?.Name ?? "Admin";

        // Find users of target supplier
        var targetUsers = dbContext.Users.Where(u => u.SupplierId == id).ToList();
        if (!targetUsers.Any()) return NotFound("No users found for this supplier.");

        foreach (var user in targetUsers)
        {
            await notificationService.CreateNotificationAsync(user.Id, $"Message from {senderName}: {dto.Message}");
        }

        return Ok(new { message = "Message sent successfully" });
    }
}

public class SendMessageDto
{
    public string Message { get; set; } = string.Empty;
}
