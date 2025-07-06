using AccountService.APIServices;
using AccountService.DBContext;
using AccountService.Repo;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<AccountDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AccountDbConnection"))
    );
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHttpClient<ICustomerApiClient, CustomerApiClient>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["CustomerApi:BaseAddress"]);
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    })
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
        return handler;
    });
}
else
{
    builder.Services.AddHttpClient<ICustomerApiClient, CustomerApiClient>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["CustomerApi:BaseAddress"]);
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    });
}
builder.Services.AddScoped<IAccountRepo, AccountRepo>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.ToString());
});

builder.Services.AddHttpContextAccessor();
var app = builder.Build();

app.UseCors(options =>
{
    options.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
