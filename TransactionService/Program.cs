using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using TransactionService.ApiServices;
using TransactionService.DBContext;
using TransactionService.Repo;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<TransactionDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TransactionDbConnection"))
    );
builder.Services.AddEndpointsApiExplorer();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHttpClient<IAccountApiClient, AccountApiClient>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["AccountApi:BaseAddress"]);
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }).ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
        return handler;
    });
}
else
{
    builder.Services.AddHttpClient<IAccountApiClient, AccountApiClient>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["AccountApi:BaseAddress"]);
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    });
}
builder.Services.AddScoped<ITransRepo, TransRepo>();
builder.Services.AddSwaggerGen();

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
