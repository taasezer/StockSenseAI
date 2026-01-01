using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StockSenseAI.Api.Hubs;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Services;

namespace StockSenseAI.Api.Controllers;

// [Authorize] // Commented out for demo - allow anonymous access
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IHubContext<ProductHub> _hubContext;

    public ProductsController(IProductService productService, IHubContext<ProductHub> hubContext)
    {
        _productService = productService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _productService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductDto productDto)
    {
        var product = await _productService.CreateAsync(productDto);
        await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", product);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductDto productDto)
    {
        var product = await _productService.UpdateAsync(id, productDto);
        if (product == null) return NotFound();
        await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", product);
        return Ok(product);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _productService.DeleteAsync(id);
        if (!result) return NotFound();
        await _hubContext.Clients.All.SendAsync("ReceiveProductDeleted", id);
        return NoContent();
    }

    [HttpPost("{id}/predict")]
    public async Task<IActionResult> PredictSales(int id)
    {
        var prediction = await _productService.PredictNextMonthSalesAsync(id);
        if (prediction == null) return NotFound();
        await _hubContext.Clients.All.SendAsync("ReceiveSalesPrediction", id, prediction.PredictedSales);
        return Ok(prediction);
    }

    [HttpPost("{id}/generate-description")]
    public async Task<IActionResult> GenerateDescription(int id)
    {
        var product = await _productService.GenerateDescriptionAsync(id);
        if (product == null) return NotFound();
        await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", product);
        return Ok(product);
    }
}
