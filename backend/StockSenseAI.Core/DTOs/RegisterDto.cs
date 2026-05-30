namespace StockSenseAI.Core.DTOs;

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? SupplierCode { get; set; } // Boşsa yeni tedarikçi, doluysa çalışan girişi
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
}
