namespace StockSenseAI.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public string? EmployeeCode { get; set; }
}
