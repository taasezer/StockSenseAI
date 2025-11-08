FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["backend/StockSenseAI.Api/StockSenseAI.Api.csproj", "StockSenseAI.Api/"]
COPY ["backend/StockSenseAI.Core/StockSenseAI.Core.csproj", "StockSenseAI.Core/"]
COPY ["backend/StockSenseAI.Infrastructure/StockSenseAI.Infrastructure.csproj", "StockSenseAI.Infrastructure/"]
COPY ["backend/StockSenseAI.Services/StockSenseAI.Services.csproj", "StockSenseAI.Services/"]

# Restore dependencies
RUN dotnet restore "StockSenseAI.Api/StockSenseAI.Api.csproj"

# Copy all backend files
COPY backend/ .

# Build and publish
RUN dotnet publish "StockSenseAI.Api/StockSenseAI.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
EXPOSE 10000

ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]
