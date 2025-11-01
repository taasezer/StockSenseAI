# 1. Aşama: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Çözüm dosyasını ve projeleri kopyala
COPY backend/StockSenseAI.sln ./
COPY backend/StockSenseAI.Api/StockSenseAI.Api.csproj StockSenseAI.Api/
COPY backend/StockSenseAI.Core/StockSenseAI.Core.csproj StockSenseAI.Core/
COPY backend/StockSenseAI.Infrastructure/StockSenseAI.Infrastructure.csproj StockSenseAI.Infrastructure/
COPY backend/StockSenseAI.Services/StockSenseAI.Services.csproj StockSenseAI.Services/

# Restore
RUN dotnet restore StockSenseAI.sln

# Kodun geri kalanını kopyala
COPY backend/ ./

# Build ve Publish
RUN dotnet publish "StockSenseAI.Api/StockSenseAI.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Aşama: Final
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]