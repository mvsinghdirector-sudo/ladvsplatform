using Azure.Storage.Blobs;
using Microsoft.Azure.Cosmos;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cosmos DB
// Cosmos DB - with System.Text.Json serializer
builder.Services.AddSingleton(new CosmosClient(
    builder.Configuration.GetConnectionString("CosmosDB"),
    new CosmosClientOptions
    {
        SerializerOptions = new CosmosSerializationOptions
        {
            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
        }
    }));

// Blob Storage
builder.Services.AddSingleton(new BlobServiceClient(
    builder.Configuration["BlobStorage:ConnectionString"]));

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