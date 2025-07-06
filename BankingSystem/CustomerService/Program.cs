using CustomerService.DBContext;
using CustomerService.Repo;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<CustomerDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CustomerDbConnection"))
    );

builder.Services.AddScoped<ICustomerRepo, CustomerRepo>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});


var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAll");
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
