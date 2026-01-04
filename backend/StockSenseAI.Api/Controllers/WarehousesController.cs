using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    #region Warehouse CRUD

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var warehouses = await _warehouseService.GetAllWarehousesAsync();
        return Ok(warehouses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
        return warehouse == null ? NotFound() : Ok(warehouse);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] WarehouseDto dto)
    {
        var warehouse = await _warehouseService.CreateWarehouseAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] WarehouseDto dto)
    {
        var warehouse = await _warehouseService.UpdateWarehouseAsync(id, dto);
        return warehouse == null ? NotFound() : Ok(warehouse);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _warehouseService.DeleteWarehouseAsync(id);
        return result ? NoContent() : NotFound();
    }

    #endregion

    #region Stock Management

    [HttpGet("{id}/stock")]
    public async Task<IActionResult> GetWarehouseStock(int id)
    {
        var stock = await _warehouseService.GetWarehouseStockAsync(id);
        return Ok(stock);
    }

    [HttpPost("{id}/stock")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AddOrUpdateStock(int id, [FromBody] WarehouseStockDto dto)
    {
        var stock = await _warehouseService.AddOrUpdateStockAsync(id, dto);
        return stock == null ? NotFound() : Ok(stock);
    }

    [HttpGet("product/{productId}/stock")]
    public async Task<IActionResult> GetProductStockAcrossWarehouses(int productId)
    {
        var stocks = await _warehouseService.GetProductStockAcrossWarehousesAsync(productId);
        return Ok(stocks);
    }

    #endregion

    #region Transfers

    [HttpGet("transfers")]
    public async Task<IActionResult> GetAllTransfers()
    {
        var transfers = await _warehouseService.GetAllTransfersAsync();
        return Ok(transfers);
    }

    [HttpGet("transfers/pending")]
    public async Task<IActionResult> GetPendingTransfers()
    {
        var transfers = await _warehouseService.GetPendingTransfersAsync();
        return Ok(transfers);
    }

    [HttpPost("transfers")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateTransfer([FromBody] StockTransferDto dto)
    {
        try
        {
            var transfer = await _warehouseService.CreateTransferAsync(dto);
            return Ok(transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("transfers/{id}/complete")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CompleteTransfer(int id)
    {
        var transfer = await _warehouseService.CompleteTransferAsync(id);
        return transfer == null ? NotFound() : Ok(transfer);
    }

    [HttpPost("transfers/{id}/cancel")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CancelTransfer(int id)
    {
        var result = await _warehouseService.CancelTransferAsync(id);
        return result ? NoContent() : NotFound();
    }

    #endregion
}
