$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:Jwt__Key = "your-super-secret-key-min-32-chars-for-jwt-token-generation"
$env:Jwt__Issuer = "StockSenseAI"
$env:Jwt__Audience = "StockSenseAI"
$env:OpenAI__ApiKey = "sk-test-key"

Set-Location backend\StockSenseAI.Api
dotnet run --urls http://localhost:5000
