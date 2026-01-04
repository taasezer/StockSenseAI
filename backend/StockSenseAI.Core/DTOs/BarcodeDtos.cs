namespace StockSenseAI.Core.DTOs;

public class BarcodeDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string BarcodeType { get; set; } = "QR"; // QR, Code128, Code39
    public string BarcodeData { get; set; } = string.Empty;
    public string ImageBase64 { get; set; } = string.Empty;
}

public class GenerateBarcodeRequest
{
    public int ProductId { get; set; }
    public string BarcodeType { get; set; } = "QR";
    public int Size { get; set; } = 200;
    public bool IncludeLabel { get; set; } = true;
}

public class ScanResultDto
{
    public bool Found { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? Sku { get; set; }
    public int? StockCount { get; set; }
    public decimal? Price { get; set; }
    public string? WarehouseLocation { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ProductLabelDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string QrCodeBase64 { get; set; } = string.Empty;
    public string BarcodeBase64 { get; set; } = string.Empty;
}
