using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private int GetSupplierId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "SupplierId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var supplierId = GetSupplierId();
        if (supplierId == 0) return BadRequest("No Supplier Context");

        var tasks = await _taskService.GetAllTasksAsync(supplierId);
        return Ok(tasks);
    }

    [HttpPost("generate-ai")]
    public async Task<IActionResult> GenerateAITasks()
    {
        var supplierId = GetSupplierId();
        if (supplierId == 0) return BadRequest("No Supplier Context");

        await _taskService.GenerateAITasksAsync(supplierId);
        return Ok(new { message = "AI tasks generated successfully based on current stock and shipments." });
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? AssignedUserId { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        var supplierId = GetSupplierId();
        if (supplierId == 0) return BadRequest("No Supplier Context");

        var task = await _taskService.AssignTaskAsync(dto.Title, dto.Description, null, supplierId, dto.AssignedUserId);
        return Ok(task);
    }

    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        var supplierId = GetSupplierId();
        if (supplierId == 0) return BadRequest("No Supplier Context");

        var success = await _taskService.CompleteTaskAsync(id, supplierId);
        if (!success) return NotFound();

        return Ok(new { message = "Task completed" });
    }
}
