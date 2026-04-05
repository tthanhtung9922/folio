using DotNetEnv;
using Folio.Infrastructure;

// Load .env từ repo root (tìm ngược lên thư mục cha nếu không thấy ở CWD)
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddInfrastructure(builder.Configuration); // Đăng ký dịch vụ của Infrastructure layer vào DI container, truyền vào IConfiguration để đọc connection string và các cấu hình khác nếu cần.

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
