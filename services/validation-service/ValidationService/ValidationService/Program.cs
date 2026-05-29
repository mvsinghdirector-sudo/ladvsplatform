using Microsoft.EntityFrameworkCore;
using Serilog;
using ValidationService.Data;
using ValidationService.Services;
using ValidationService.Workers;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ValidationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("ValidationDB")));

// Services
builder.Services.AddScoped<IValidationEngine, ValidationEngine>();
builder.Services.AddScoped<IEventPublisher, EventPublisher>();

// Background Worker
builder.Services.AddHostedService<ValidationWorker>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();