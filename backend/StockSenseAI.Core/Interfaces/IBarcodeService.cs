using StockSenseAI.Core.DTOs;

namespace StockSenseAI.Core.Interfaces;

public interface IBarcodeService
{
    Task<BarcodeDto> GenerateBarcodeAsync(GenerateBarcodeRequest request);
    Task<ScanResultDto> LookupByBarcodeAsync(string barcodeData);
    Task<ProductLabelDto?> GenerateProductLabelAsync(int productId);
    Task<IEnumerable<BarcodeDto>> GenerateBulkBarcodesAsync(IEnumerable<int> productIds, string barcodeType = "QR");
    Task<byte[]> GenerateLabelSheetPdfAsync(IEnumerable<int> productIds);
}
