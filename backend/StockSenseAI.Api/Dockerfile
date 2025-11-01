# 1. Aşama: Build (Derleme)
# Projenizin SDK sürümüne göre (8.0, 7.0 vb.) burayı güncelleyebilirsiniz
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarını (.csproj) ve çözüm dosyasını (.sln) kopyala
COPY backend/StockSenseAI.sln .
COPY backend/StockSenseAI.Api/StockSenseAI.Api.csproj backend/StockSenseAI.Api/
COPY backend/StockSenseAI.Core/StockSenseAI.Core.csproj backend/StockSenseAI.Core/
COPY backend/StockSenseAI.Infrastructure/StockSenseAI.Infrastructure.csproj backend/StockSenseAI.Infrastructure/
COPY backend/StockSenseAI.Services/StockSenseAI.Services.csproj backend/StockSenseAI.Services/

# Paketleri geri yükle
RUN dotnet restore StockSenseAI.sln

# Projenin geri kalan tüm dosyalarını kopyala
COPY backend/ .

# Projeyi publish (yayınla)
RUN dotnet publish "backend/StockSenseAI.Api/StockSenseAI.Api.csproj" -c Release -o /app/publish

# 2. Aşama: Final (Çalıştırma)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render, PORT ortam değişkenini otomatik olarak sağlar
ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]