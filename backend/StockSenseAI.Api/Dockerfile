# .NET 8 SDK imajı
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala
COPY . .

# Restore işlemini çöz
RUN dotnet restore "StockSenseAI.sln"

# Yayına hazır sürüm oluştur
RUN dotnet publish "StockSenseAI.Api/StockSenseAI.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Çalışma aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render PORT değişkenini kullan
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 10000

ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]
