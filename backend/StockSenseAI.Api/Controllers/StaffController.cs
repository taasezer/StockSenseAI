using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Supplier")]
    public class StaffController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public StaffController(AppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStaff()
        {
            var supplierId = _currentUserService.SupplierId;
            if (supplierId == 0) return Unauthorized();

            var staff = await _context.Users
                .Where(u => u.SupplierId == supplierId && u.Role == "Staff")
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.EmployeeCode,
                    TaskCount = _context.EmployeeTasks.Count(t => t.AssignedUserId == u.Id && t.Status != "Completed")
                })
                .ToListAsync();

            return Ok(staff);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetAllTasks()
        {
            var supplierId = _currentUserService.SupplierId;
            if (supplierId == 0) return Unauthorized();

            var tasks = await _context.EmployeeTasks
                .Include(t => t.AssignedUser)
                .Where(t => t.SupplierId == supplierId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.CreatedAt,
                    t.CompletedAt,
                    AssignedTo = t.AssignedUser != null ? t.AssignedUser.Username : "Unassigned",
                    EmployeeCode = t.AssignedUser != null ? t.AssignedUser.EmployeeCode : null
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPost("tasks")]
        public async Task<IActionResult> AssignTask([FromBody] AssignTaskRequest request)
        {
            var supplierId = _currentUserService.SupplierId;
            if (supplierId == 0) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == request.EmployeeCode && u.SupplierId == supplierId);
            if (user == null) return BadRequest("Invalid Employee Code.");

            var task = new EmployeeTask
            {
                Title = request.Title,
                Description = request.Description,
                AssignedUserId = user.Id,
                SupplierId = supplierId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.EmployeeTasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task assigned successfully." });
        }
    }

    public class AssignTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
    }
}
