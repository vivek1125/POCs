using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MMLib.SwaggerForOcelot.DependencyInjection;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;
using APIGateway.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add configuration for Ocelot - environment specific
var environment = builder.Environment.EnvironmentName;
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"ocelot.{environment}.json", optional: true, reloadOnChange: true);

// Add services to the container
builder.Services.AddControllers();

// Add Ocelot
builder.Services.AddOcelot(builder.Configuration);

// Add Swagger for Ocelot
builder.Services.AddSwaggerForOcelot(builder.Configuration);

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] 
                ?? throw new InvalidOperationException("Jwt:Key is not configured")))
        };
    });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Add global exception handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerForOcelotUI(opt =>
    {
        opt.PathToSwaggerGenerator = "/swagger/docs";
        opt.ReConfigureUpstreamSwaggerJson = AlterUpstreamSwaggerJson;
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors();

// Enable Authentication
app.UseAuthentication();

// Map health controllers
app.MapControllers();

// Use Ocelot middleware
await app.UseOcelot();

app.Run();

/// <summary>
/// Reconfigure upstream swagger json to include the API Gateway base URL
/// </summary>
/// <param name="context">HTTP context</param>
/// <param name="swaggerJson">Original swagger json</param>
/// <returns>Modified swagger json</returns>
static string AlterUpstreamSwaggerJson(HttpContext context, string swaggerJson)
{
    try
    {
        if (string.IsNullOrWhiteSpace(swaggerJson))
            return swaggerJson;

        var swagger = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(swaggerJson);
        
        if (swagger == null)
            return swaggerJson;
        
        // Update the servers to point to the API Gateway
        swagger.servers = new[]
        {
            new { url = "https://localhost:7210", description = "API Gateway" }
        };
        
        return Newtonsoft.Json.JsonConvert.SerializeObject(swagger, Newtonsoft.Json.Formatting.Indented);
    }
    catch (Exception)
    {
        // If there's any error in processing, return the original swagger JSON
        return swaggerJson;
    }
}