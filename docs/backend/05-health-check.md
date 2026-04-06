# Backend — Bước 5: Health Check Endpoint

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Thêm `GET /health` endpoint để kiểm tra trạng thái app và kết nối database — dùng built-in Health Checks middleware của ASP.NET Core kết hợp EF Core health check provider.
> **Yêu cầu:** Đã hoàn thành Bước 1–4. PostgreSQL container đang chạy.

---

## Tổng quan — sẽ thay đổi gì

```
api/src/
├── Folio.Infrastructure/
│   ├── Folio.Infrastructure.csproj   ← thêm package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore
│   └── DependencyInjection.cs        ← thêm .AddDbContextCheck<AppDbContext>()
└── Folio.Api/
    └── Program.cs                    ← thêm app.MapHealthChecks("/health")
```

Khi xong, truy cập `http://localhost:5000/health` sẽ trả về:
- `Healthy` (HTTP 200) — app đang chạy, kết nối được database
- `Unhealthy` (HTTP 503) — database không phản hồi

---

## Bước 1 — Cài package cho `Folio.Infrastructure`

Package `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` cung cấp extension method `AddDbContextCheck<T>()` — kiểm tra kết nối database thông qua `AppDbContext` đã được cấu hình sẵn.

> **Tại sao cài vào `Folio.Infrastructure` chứ không phải `Folio.Api`?** Vì logic đăng ký health check của database gắn với `AppDbContext` — nằm trong `DependencyInjection.cs` của Infrastructure. Giữ mọi thứ liên quan đến database ở một chỗ.

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet add src/Folio.Infrastructure/Folio.Infrastructure.csproj package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore --version 10.0.5
```

Output kỳ vọng:

```
info : PackageReference for package 'Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore' version '10.0.5' added to file '...\Folio.Infrastructure.csproj'.
```

---

## Bước 2 — Cập nhật `DependencyInjection.cs`

Trong **Visual Studio 2026**, mở **Solution Explorer** → mở rộng `Folio.Infrastructure` → double-click vào file **`DependencyInjection.cs`**.

Tìm đoạn:

```csharp
services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
```

Thêm `.AddHealthChecks().AddDbContextCheck<AppDbContext>()` vào **phía sau** dòng đăng ký DbContext, trước `return services;`:

```csharp
services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();
```

Toàn bộ file sau khi sửa:

```csharp
using Folio.Application.Common.Interfaces;
using Folio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Folio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>();

        return services;
    }
}
```

Lưu file: `Ctrl + S`.

> **`AddDbContextCheck<AppDbContext>()`:** Tự động tạo một health check tên `AppDbContext` — khi được gọi, nó chạy `context.Database.CanConnectAsync()` để xác nhận kết nối PostgreSQL đang hoạt động. Không cần cấu hình thêm gì vì đã reuse `AppDbContext` từ DI.

---

## Bước 3 — Thêm endpoint vào `Program.cs`

Trong **Solution Explorer** → double-click vào **`Program.cs`** trong project `Folio.Api`.

Thêm `app.MapHealthChecks("/health")` **trước** `app.Run()`. Đặt nó cùng nhóm với các route khác (`MapControllers`):

```csharp
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");    // ← thêm dòng này

app.Run();
```

Toàn bộ `Program.cs` sau khi sửa:

```csharp
using DotNetEnv;
using Folio.Infrastructure;
using Scalar.AspNetCore;

// Load .env từ repo root (tìm ngược lên thư mục cha nếu không thấy ở CWD)
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

Lưu file: `Ctrl + S`.

---

## Bước 4 — Kiểm tra build

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet build Folio.slnx
```

Output kỳ vọng:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

---

## Bước 5 — Chạy app và test endpoint

### Khởi động PostgreSQL (nếu chưa chạy)

Từ thư mục gốc repo:

```bash
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db
```

Chờ đến khi status là `(healthy)`:

```bash
docker compose -f infra/docker-compose.yml --env-file .env.dev ps
```

### Chạy app

Từ thư mục `api/`:

```bash
dotnet run --project src/Folio.Api/Folio.Api.csproj
```

### Test endpoint

Mở browser hoặc một tab Terminal mới, truy cập:

```
http://localhost:5000/health
```

Response kỳ vọng (plain text):

```
Healthy
```

HTTP status code: `200 OK`.

> **Test khi database down:** Dừng container `docker compose ... down`, sau đó truy cập lại `/health` — response sẽ là `Unhealthy` với HTTP `503 Service Unavailable`.

### Kiểm tra qua curl

```bash
curl -i http://localhost:5000/health
```

Output kỳ vọng:

```
HTTP/1.1 200 OK
Content-Type: text/plain
...

Healthy
```

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `No service for type 'IHealthCheckService'` | Thiếu `AddHealthChecks()` trong DI | Kiểm tra `DependencyInjection.cs` đã gọi `AddHealthChecks()` |
| Endpoint trả `Unhealthy` ngay khi start | Database chưa sẵn sàng | Chờ container `(healthy)` rồi thử lại |
| `404 Not Found` tại `/health` | Thiếu `MapHealthChecks` trong `Program.cs` | Kiểm tra `app.MapHealthChecks("/health")` đã có sau `app.UseAuthorization()` |

---

## Kết quả sau bước này

- `GET /health` → `200 Healthy` khi PostgreSQL đang chạy
- `GET /health` → `503 Unhealthy` khi PostgreSQL down

**Package distribution cập nhật:**

| Project | Packages |
|---|---|
| `Folio.Domain` | _(không có)_ |
| `Folio.Application` | _(không có)_ |
| `Folio.Infrastructure` | `Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1`, `Microsoft.EntityFrameworkCore.Design 10.0.5`, `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore 10.0.5` |
| `Folio.Api` | `Microsoft.EntityFrameworkCore.Design 10.0.5`, `DotNetEnv 3.1.1`, `Microsoft.AspNetCore.OpenApi 10.0.5`, `Scalar.AspNetCore 2.13.20` |

---

**Tiếp theo:** [06-first-controller.md](06-first-controller.md) — Tạo controller đầu tiên, test với Scalar UI.
