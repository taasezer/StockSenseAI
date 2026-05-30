using Microsoft.AspNetCore.Http;
using StockSenseAI.Core.Interfaces;

namespace StockSenseAI.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int SupplierId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == "SupplierId")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }

    public int UserId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }
}
