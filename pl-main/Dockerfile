# Multi-stage build for .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Directory.Build.props", "."]
COPY ["Directory.Build.targets", "."]
COPY ["profiler.sln", "."]
COPY ["apps/api-app/", "apps/api-app/"]
COPY ["libs/api/", "libs/api/"]

# Restore and build
RUN dotnet restore "profiler.sln"
RUN dotnet build "profiler.sln" -c Release --no-restore

# Publish
RUN dotnet publish "apps/api-app/Gen.StarterApp.Api.csproj" -c Release -o /app/publish --no-build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run application
ENTRYPOINT ["dotnet", "Gen.StarterApp.Api.dll"]
