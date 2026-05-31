using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StockSenseAI.Api.Hubs;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Services;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace StockSenseAI.Api.Controllers;

[Authorize]
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

    [Authorize(Roles = "Admin,Supplier")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductDto productDto)
    {
        var product = await _productService.CreateAsync(productDto);
        await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", product);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [Authorize(Roles = "Admin,Supplier")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductDto productDto)
    {
        var product = await _productService.UpdateAsync(id, productDto);
        if (product == null) return NotFound();
        await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", product);
        return Ok(product);
    }

    [Authorize(Roles = "Admin,Supplier")]
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

    [HttpPost("{id}/upload-image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");

        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound();

        using (var memoryStream = new MemoryStream())
        {
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            var base64String = Convert.ToBase64String(fileBytes);
            var mimeType = file.ContentType;
            var dataUrl = $"data:{mimeType};base64,{base64String}";

            var productDto = new ProductDto
            {
                Name = product.Name,
                Sku = product.Sku,
                Price = product.Price,
                Category = product.Category,
                StockCount = product.StockCount,
                ReorderLevel = product.ReorderLevel,
                LeadTimeDays = product.LeadTimeDays,
                SupplierId = product.SupplierId,
                Description = product.Description,
                ImageUrl = dataUrl // Save directly to database
            };

            var updatedProduct = await _productService.UpdateAsync(id, productDto);
            await _hubContext.Clients.All.SendAsync("ReceiveProductUpdate", updatedProduct);
            return Ok(updatedProduct);
        }
    }
}
