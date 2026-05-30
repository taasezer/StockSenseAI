using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StockSenseAI.Api.Hubs;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;
using StockSenseAI.Core.Interfaces;
using StockSenseAI.Infrastructure;

namespace StockSenseAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly ICurrentUserService _currentUserService;

    public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext, ICurrentUserService currentUserService)
    {
        _context = context;
        _hubContext = hubContext;
        _currentUserService = currentUserService;
    }

    private int GetSupplierId() => _currentUserService.SupplierId;
    private int GetUserId() => _currentUserService.UserId > 0 ? _currentUserService.UserId : int.Parse(User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts()
    {
        var currentSupplierId = GetSupplierId();
        if (currentSupplierId == 0) return Unauthorized("Only suppliers can use chat.");

        // Get all other suppliers
        var suppliers = await _context.Suppliers
            .Where(s => s.Id != currentSupplierId)
            .Select(s => new {
                s.Id,
                s.Name,
                s.SupplierCode,
                UnreadCount = _context.SupplierMessages.Count(m => m.SenderSupplierId == s.Id && m.ReceiverSupplierId == currentSupplierId && !m.IsRead)
            })
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpGet("{otherSupplierId}")]
    public async Task<IActionResult> GetMessages(int otherSupplierId)
    {
        var currentSupplierId = GetSupplierId();
        if (currentSupplierId == 0) return Unauthorized();

        var messages = await _context.SupplierMessages
            .Include(m => m.SenderSupplier)
            .Include(m => m.ReceiverSupplier)
            .Include(m => m.SenderUser)
            .Where(m => 
                (m.SenderSupplierId == currentSupplierId && m.ReceiverSupplierId == otherSupplierId) ||
                (m.SenderSupplierId == otherSupplierId && m.ReceiverSupplierId == currentSupplierId))
            .OrderBy(m => m.CreatedAt)
            .Select(m => new SupplierMessageDto
            {
                Id = m.Id,
                SenderSupplierId = m.SenderSupplierId,
                SenderSupplierName = m.SenderSupplier.Name,
                ReceiverSupplierId = m.ReceiverSupplierId,
                ReceiverSupplierName = m.ReceiverSupplier.Name,
                SenderUserId = m.SenderUserId,
                SenderUserName = m.SenderUser.Username,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendChatMessageDto dto)
    {
        var currentSupplierId = GetSupplierId();
        if (currentSupplierId == 0) return Unauthorized();

        var currentUserId = GetUserId();

        var message = new SupplierMessage
        {
            SenderSupplierId = currentSupplierId,
            ReceiverSupplierId = dto.ReceiverSupplierId,
            SenderUserId = currentUserId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.SupplierMessages.Add(message);
        await _context.SaveChangesAsync();

        var senderSupplier = await _context.Suppliers.FindAsync(currentSupplierId);
        var senderUser = await _context.Users.FindAsync(currentUserId);
        var receiverSupplier = await _context.Suppliers.FindAsync(dto.ReceiverSupplierId);

        var messageDto = new SupplierMessageDto
        {
            Id = message.Id,
            SenderSupplierId = message.SenderSupplierId,
            SenderSupplierName = senderSupplier?.Name ?? "",
            ReceiverSupplierId = message.ReceiverSupplierId,
            ReceiverSupplierName = receiverSupplier?.Name ?? "",
            SenderUserId = message.SenderUserId,
            SenderUserName = senderUser?.Username ?? "",
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            IsRead = message.IsRead
        };

        // Broadcast to receiver supplier group
        await _hubContext.Clients.Group($"Supplier_{dto.ReceiverSupplierId}").SendAsync("ReceiveMessage", messageDto);
        // Also send to the sender's group to update other tabs
        await _hubContext.Clients.Group($"Supplier_{currentSupplierId}").SendAsync("ReceiveMessage", messageDto);

        return Ok(messageDto);
    }

    [HttpPut("{otherSupplierId}/read")]
    public async Task<IActionResult> MarkAsRead(int otherSupplierId)
    {
        var currentSupplierId = GetSupplierId();
        if (currentSupplierId == 0) return Unauthorized();

        var unreadMessages = await _context.SupplierMessages
            .Where(m => m.SenderSupplierId == otherSupplierId && m.ReceiverSupplierId == currentSupplierId && !m.IsRead)
            .ToListAsync();

        if (unreadMessages.Any())
        {
            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true });
    }
}
