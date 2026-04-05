# Backend — Bước 3: AppDbContext, IAppDbContext, DI Registration

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo `IAppDbContext` interface trong Application, `AppDbContext` trong Infrastructure, đăng ký DI qua extension method, quản lý credentials bằng `.env` file.
> **Trạng thái source hiện tại:** Các project còn trống, `Program.cs` là template gốc, chưa có ConnectionString trong appsettings.

---

## Tổng quan — sẽ tạo những gì

```
folio/                                      ← repo root
├── .env                                    ← gitignored, chứa credentials thật (dùng chung cho cả Docker Compose và .NET)
├── .env.example                            ← committed, template cho team
└── api/
    └── src/
    ├── Folio.Application/
    │   └── Common/
    │       └── Interfaces/
    │           └── IAppDbContext.cs        ← interface thuần, không có EF Core dependency
    ├── Folio.Infrastructure/
    │   ├── Persistence/
    │   │   └── AppDbContext.cs             ← implement DbContext + IAppDbContext
    │   └── DependencyInjection.cs          ← extension method AddInfrastructure()
    └── Folio.Api/
        ├── Program.cs                      ← load .env trước, rồi AddInfrastructure()
        ├── appsettings.json                ← cấu trúc key, không có credentials
        └── appsettings.Development.json    ← logging config cho dev
```

---

## Bước 1 — Cài package `DotNetEnv` vào `Folio.Api`

`DotNetEnv` là thư viện đọc file `.env` và nạp vào environment variables của process — sau đó .NET config system tự đọc bình thường.

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet add src/Folio.Api/Folio.Api.csproj package DotNetEnv --version 3.1.1
```

Output kỳ vọng:

```
info : PackageReference for package 'DotNetEnv' version '3.1.1' added to file '...\Folio.Api.csproj'.
```

---

## Bước 2 — Tạo file `.env.example` ở repo root

File này được **commit vào Git** — là template để mọi người trong team biết cần set những biến gì, nhưng không chứa giá trị thật.

Tạo file `.env.example` tại **thư mục gốc repo** (`folio/.env.example`) bằng cách mở Notepad hoặc VS Code, với nội dung:

```env
# PostgreSQL — dùng chung cho Docker Compose và .NET app
POSTGRES_DB=folio
POSTGRES_USER=
POSTGRES_PASSWORD=

# Connection string cho .NET (phải khớp với 3 biến trên)
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=folio;Username=;Password=

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
```

---

## Bước 3 — Tạo file `.env` ở repo root

File này **KHÔNG được commit** — đã có trong `.gitignore` root dòng `.env*`.

Tạo file `.env` tại **thư mục gốc repo** (`folio/.env`), copy từ `.env.example` và điền giá trị thật:

```env
# PostgreSQL — dùng chung cho Docker Compose và .NET app
POSTGRES_DB=folio
POSTGRES_USER=sa
POSTGRES_PASSWORD=A@a123456

# Connection string cho .NET (phải khớp với 3 biến trên)
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=folio;Username=sa;Password=A@a123456

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
```

> **Tại sao đặt ở repo root?** Docker Compose tự động đọc `.env` từ thư mục hiện tại — khi chạy `docker compose -f infra/docker-compose.dev.yml up -d` từ repo root, nó tìm `folio/.env` ngay. .NET app dùng `Env.TraversePath().Load()` để tìm ngược lên từ `api/src/Folio.Api/` → `api/src/` → `api/` → `folio/` cho đến khi gặp file `.env`. Một file duy nhất, cả hai đều đọc được.

> **Naming convention `__`:** .NET config dùng `__` (double underscore) thay cho `:` để map env var vào JSON config. `ConnectionStrings__DefaultConnection` tương đương `ConnectionStrings:DefaultConnection`.

> **Xác nhận `.env` đã bị ignore:** Chạy `git status` từ repo root — không được thấy `.env` trong danh sách.

---

## Bước 4 — Tạo thư mục `Common/Interfaces/` trong `Folio.Application`

Trong **Visual Studio 2026**, mở **Solution Explorer** (`Ctrl + Alt + L`):

1. Click chuột phải vào project **`Folio.Application`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Common` → nhấn `Enter`
4. Click chuột phải vào folder **`Common`** vừa tạo
5. Chọn **Add** → **New Folder**
6. Đặt tên `Interfaces` → nhấn `Enter`

---

## Bước 5 — Tạo file `IAppDbContext.cs`

Trong **Solution Explorer**:

1. Click chuột phải vào folder **`Interfaces`** (bên trong `Common`)
2. Chọn **Add** → **New Item...**
3. Trong hộp thoại, tìm và chọn **Interface**
4. Đặt tên `IAppDbContext.cs` → click **Add**

**Xóa toàn bộ nội dung mặc định**, nhập:

```csharp
namespace Folio.Application.Common.Interfaces;

public interface IAppDbContext
{
    // Thêm DbSet cho từng entity ở đây khi có entity
    // Ví dụ: DbSet<Post> Posts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

> **Không có `using Microsoft.EntityFrameworkCore`** — Application layer không được phụ thuộc vào EF Core. `DbSet<T>` sẽ thêm sau khi cần entity, lúc đó mới thêm `using`.

> **Tại sao interface này ở Application?** Application layer định nghĩa _hợp đồng_ — nó cần biết DbContext có những gì (các `DbSet`) để viết use cases, nhưng không được phụ thuộc vào EF Core implementation. Đây là Dependency Inversion: Application layer phụ thuộc vào abstraction, Infrastructure layer implement abstraction đó.

Lưu file: `Ctrl + S`.

---

## Bước 6 — Tạo thư mục `Persistence/` trong `Folio.Infrastructure`

Trong **Solution Explorer**:

1. Click chuột phải vào project **`Folio.Infrastructure`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Persistence` → nhấn `Enter`

---

## Bước 7 — Tạo file `AppDbContext.cs`

Trong **Solution Explorer**:

1. Click chuột phải vào folder **`Persistence`**
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `AppDbContext.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using Folio.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Folio.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Thêm DbSet cho từng entity ở đây khi có entity
    // Ví dụ: public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động load tất cả IEntityTypeConfiguration trong assembly này
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

> **`ApplyConfigurationsFromAssembly`:** Pattern này tự động quét và load tất cả class implement `IEntityTypeConfiguration<T>` trong cùng assembly. Giúp `OnModelCreating` luôn gọn, không phình to theo số entity.

Lưu file: `Ctrl + S`.

---

## Bước 8 — Tạo file `DependencyInjection.cs` trong `Folio.Infrastructure`

Trong **Solution Explorer**:

1. Click chuột phải vào project **`Folio.Infrastructure`** (không phải thư mục con)
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `DependencyInjection.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using Folio.Application.Common.Interfaces;
using Folio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Folio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IAppDbContext>(provider =>
            provider.GetRequiredService<AppDbContext>());

        return services;
    }
}
```

> **`?? throw`:** Fail fast — nếu `.env` bị thiếu hoặc key sai tên, app crash ngay lúc khởi động thay vì crash runtime khi có request. Dễ debug hơn nhiều.

Lưu file: `Ctrl + S`.

---

## Bước 9 — Cập nhật `appsettings.json`

Trong **Solution Explorer** → double-click vào **`appsettings.json`** trong project `Folio.Api`.

File này chỉ khai báo **cấu trúc key**, không có credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Lưu file: `Ctrl + S`.

---

## Bước 10 — Cập nhật `appsettings.Development.json`

Trong **Solution Explorer** → double-click vào **`appsettings.Development.json`**.

Chỉ đặt logging config — bật SQL query log khi chạy local:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

> **`Microsoft.EntityFrameworkCore.Database.Command: Information`** — hiển thị SQL queries EF Core generate ra console. Rất hữu ích khi debug.

Lưu file: `Ctrl + S`.

---

## Bước 11 — Cập nhật `Program.cs`

Trong **Solution Explorer** → double-click vào **`Program.cs`** trong project `Folio.Api`.

Thêm `Env.TraversePath().Load()` **trước** `WebApplication.CreateBuilder` — phải load `.env` trước để .NET config system đọc được:

```csharp
using DotNetEnv;
using Folio.Infrastructure;

// Tìm .env từ CWD ngược lên repo root (TraversePath tự tìm qua các thư mục cha)
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);

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
```

> **`Env.TraversePath().Load()`** — bắt đầu tìm `.env` từ thư mục working directory, rồi tìm lên các thư mục cha cho đến khi gặp file. Không throw nếu không tìm thấy — an toàn khi deploy production (chỉ dùng env vars, không có `.env` file).

Lưu file: `Ctrl + S`.

---

## Bước 12 — Kiểm tra build

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

**Lỗi thường gặp:**

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `The type or namespace 'IAppDbContext' could not be found` | Sai namespace | Kiểm tra namespace trong `IAppDbContext.cs` là `Folio.Application.Common.Interfaces` |
| `'AppDbContext' does not implement interface member 'SaveChangesAsync'` | Thiếu override | Xem lại Bước 7 |
| `Connection string 'DefaultConnection' not found` | `.env` chưa được load hoặc sai key | Kiểm tra `Env.Load()` ở đầu `Program.cs` và tên biến trong `.env` |
| `The type or namespace 'DotNetEnv' could not be found` | Chưa cài package | Chạy lại Bước 1 |

---

## Kết quả sau bước này

```
folio/                      ← repo root
├── .env                    ← gitignored ✓ (dùng chung Docker Compose + .NET)
├── .env.example            ← committed ✓
└── api/
    └── src/
    ├── Folio.Application/
    │   └── Common/Interfaces/
    │       └── IAppDbContext.cs         ✓
    ├── Folio.Infrastructure/
    │   ├── Persistence/
    │   │   └── AppDbContext.cs          ✓
    │   └── DependencyInjection.cs       ✓
    └── Folio.Api/
        ├── Program.cs                   ✓ (Env.Load() + AddInfrastructure)
        ├── appsettings.json             ✓ (key structure, no credentials)
        └── appsettings.Development.json ✓ (logging only)
```

**Luồng config theo môi trường:**

| Môi trường | Nguồn credentials |
|---|---|
| Local dev | `folio/.env` — gitignored, mỗi dev tự tạo từ `.env.example` |
| Docker Compose (dev) | Tự đọc `folio/.env` natively khi chạy từ repo root |
| Production/VPS | Environment variables inject từ Docker / systemd |

---

**Tiếp theo:** [04-docker-postgres-local.md](04-docker-postgres-local.md) — Chạy PostgreSQL local bằng Docker Compose, kiểm tra kết nối, tạo migration đầu tiên.
