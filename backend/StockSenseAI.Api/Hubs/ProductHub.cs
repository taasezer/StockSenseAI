using Microsoft.AspNetCore.SignalR;

namespace StockSenseAI.Api.Hubs;

public class ProductHub : Hub
{
    public async Task SendProductUpdate(object product)
    {
        await Clients.All.SendAsync("ReceiveProductUpdate", product);
    }

    public async Task SendSalesPrediction(int productId, int prediction)
    {
        await Clients.All.SendAsync("ReceiveSalesPrediction", productId, prediction);
    }

    public async Task SendProductDeleted(int productId)
    {
        await Clients.All.SendAsync("ReceiveProductDeleted", productId);
    }
}
