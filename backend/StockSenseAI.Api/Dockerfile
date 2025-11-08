# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files (relative to backend folder)
COPY StockSenseAI.Api/StockSenseAI.Api.csproj StockSenseAI.Api/
COPY StockSenseAI.Core/StockSenseAI.Core.csproj StockSenseAI.Core/
COPY StockSenseAI.Infrastructure/StockSenseAI.Infrastructure.csproj StockSenseAI.Infrastructure/
COPY StockSenseAI.Services/StockSenseAI.Services.csproj StockSenseAI.Services/

# Restore dependencies
RUN dotnet restore StockSenseAI.Api/StockSenseAI.Api.csproj

# Copy all backend files
COPY . .

# Build and publish
WORKDIR /src/StockSenseAI.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render PORT variable
ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
EXPOSE 10000

ENTRYPOINT ["dotnet", "StockSenseAI.Api.dll"]
