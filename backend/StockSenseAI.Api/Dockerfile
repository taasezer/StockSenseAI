# 1. Aşama: Build (Derleme)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Çözüm dosyasını kopyala
COPY backend/StockSenseAI.sln .

# Proje dosyalarını, .sln dosyasına göre doğru yollara kopyala
# (Hata buradaydı: 'backend/' önekini hedeften kaldırdık)
COPY backend/StockSenseAI.Api/StockSenseAI.Api.csproj StockSenseAI.Api/
COPY backend/StockSenseAI.Core/StockSenseAI.Core.csproj StockSenseAI.Core/
COPY backend/StockSenseAI.Infrastructure/StockSenseAI.Infrastructure.csproj StockSenseAI.Infrastructure/
COPY backend/StockSenseAI.Services/StockSenseAI.Services.csproj StockSenseAI.Services/

# Şimdi .sln dosyası, projelerini doğru yolda bulabilir
RUN dotnet restore StockSenseAI.sln

# Kodun geri kalanını da doğru yollara kopyala
# (Hata buradaydı: 'backend/' önekini hedeften kaldırdık)
COPY backend/StockSenseAI.Api/ StockSenseAI.Api/
COPY backend/StockSenseAI.Core/ StockSenseAI.Core/
COPY backend/StockSenseAI.Infrastructure/ StockSenseAI.Infrastructure/
COPY backend/StockSenseAI.Services/ StockSenseAI.Services/

# Publish et (Yolunu da düzelttik)
RUN dotnet publish "StockSenseAI.Api/StockSenseAI.Api.csproj" -c Release -o /app/publish

# 2. Aşama: Final (Çalıştırma)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]
