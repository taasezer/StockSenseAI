using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace StockSenseAI.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var supplierIdClaim = Context.User?.Claims.FirstOrDefault(c => c.Type == "SupplierId")?.Value;
        
        if (!string.IsNullOrEmpty(supplierIdClaim))
        {
            // Join a group specific to this supplier
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Supplier_{supplierIdClaim}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var supplierIdClaim = Context.User?.Claims.FirstOrDefault(c => c.Type == "SupplierId")?.Value;
        
        if (!string.IsNullOrEmpty(supplierIdClaim))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Supplier_{supplierIdClaim}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
