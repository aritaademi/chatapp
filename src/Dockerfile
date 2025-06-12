# Use the SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file first to leverage Docker layer caching
# The .csproj file is directly in the build context (which is your 'src' folder)
COPY FormulaOne.ChatService.csproj .
RUN dotnet restore

# Copy the rest of the source code
# The 'src' folder itself is the build context (the '.')
# This will copy all contents of 'src' into '/src' in the image
COPY . .

# Publish the application
RUN dotnet publish -c Release -o /app/publish

# Use the ASP.NET runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8181 

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Specify the entrypoint for the application
ENTRYPOINT ["dotnet", "FormulaOne.ChatService.dll"]