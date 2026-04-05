# Backend — Bước 3: AppDbContext, IAppDbContext, DI Registration

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo `IAppDbContext` interface trong Application, `AppDbContext` trong Infrastructure, đăng ký DI qua extension method, cấu hình connection string.
> **Trạng thái source hiện tại:** Các project còn trống, `Program.cs` là template gốc, chưa có ConnectionString trong appsettings.

---

## Tổng quan — sẽ tạo những gì

```
api/src/
├── Folio.Application/
│   └── Common/
│       └── Interfaces/
│           └── IAppDbContext.cs        ← interface thuần, không có EF Core dependency
├── Folio.Infrastructure/
│   ├── Persistence/
│   │   └── AppDbContext.cs             ← implement DbContext + IAppDbContext
│   └── DependencyInjection.cs          ← extension method AddInfrastructure()
└── Folio.Api/
    ├── Program.cs                      ← thêm builder.Services.AddInfrastructure()
    ├── appsettings.json                ← thêm ConnectionStrings (production placeholder)
    └── appsettings.Development.json    ← thêm ConnectionStrings (dev local)
```

---

## Bước 1 — Tạo thư mục `Common/Interfaces/` trong `Folio.Application`

Trong **Visual Studio 2026**, mở **Solution Explorer** (`Ctrl + Alt + L`):

1. Click chuột phải vào project **`Folio.Application`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Common` → nhấn `Enter`
4. Click chuột phải vào folder **`Common`** vừa tạo
5. Chọn **Add** → **New Folder**
6. Đặt tên `Interfaces` → nhấn `Enter`

---

## Bước 2 — Tạo file `IAppDbContext.cs`

Trong **Solution Explorer**:

1. Click chuột phải vào folder **`Interfaces`** (bên trong `Common`)
2. Chọn **Add** → **New Item...**
3. Trong hộp thoại, tìm và chọn **Interface**
4. Đặt tên `IAppDbContext.cs` → click **Add**

Visual Studio sẽ tạo file và mở ra editor. **Xóa toàn bộ nội dung mặc định**, sau đó nhập nội dung sau:

```csharp
using Microsoft.EntityFrameworkCore;

namespace Folio.Application.Common.Interfaces;

public interface IAppDbContext
{
    // Thêm DbSet cho từng entity ở đây khi có entity
    // Ví dụ: DbSet<Post> Posts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

> **Tại sao interface này ở Application?** Application layer định nghĩa _hợp đồng_ — nó cần biết DbContext có những gì (các `DbSet`) để viết use cases, nhưng không được phụ thuộc vào EF Core implementation. Đây là Dependency Inversion: Application layer phụ thuộc vào abstraction, Infrastructure layer implement abstraction đó.

Lưu file: `Ctrl + S`.

---

## Bước 3 — Tạo thư mục `Persistence/` trong `Folio.Infrastructure`

Trong **Solution Explorer**:

1. Click chuột phải vào project **`Folio.Infrastructure`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Persistence` → nhấn `Enter`

---

## Bước 4 — Tạo file `AppDbContext.cs`

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

> **`ApplyConfigurationsFromAssembly`:** Thay vì cấu hình entity trực tiếp trong `OnModelCreating`, pattern này tự động quét và load tất cả class implement `IEntityTypeConfiguration<T>` trong cùng assembly. Giúp `OnModelCreating` luôn gọn, không phình to theo số entity.

Lưu file: `Ctrl + S`.

---

## Bước 5 — Tạo file `DependencyInjection.cs` trong `Folio.Infrastructure`

Đây là extension method để đăng ký tất cả services của Infrastructure layer. `Program.cs` chỉ cần gọi một lệnh duy nhất.

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

> **`AddScoped<IAppDbContext>`:** Dòng này đăng ký mapping `IAppDbContext → AppDbContext` trong DI container. Khi một use case trong Application layer yêu cầu `IAppDbContext` qua constructor injection, DI sẽ trả về instance `AppDbContext` đã được cấu hình sẵn.

> **`?? throw`:** Pattern này fail fast — nếu connection string bị thiếu (ví dụ quên set env var khi deploy), app sẽ crash ngay lúc khởi động thay vì crash runtime khi có request đầu tiên. Dễ debug hơn nhiều.

Lưu file: `Ctrl + S`.

---

## Bước 6 — Cập nhật `appsettings.json`

Trong **Solution Explorer**, mở rộng project **`Folio.Api`** → double-click vào **`appsettings.json`**.

Thêm block `ConnectionStrings` với **cấu trúc key nhưng không có credentials** — giá trị thật sẽ được inject bên ngoài:

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

> **Tại sao để trống?** File `appsettings.json` được commit vào Git. Không bao giờ đặt credentials thật ở đây. Giá trị thật được inject qua **User Secrets** (local dev) hoặc **environment variable** (production/Docker) — .NET config tự động merge và ưu tiên các nguồn đó.

Lưu file: `Ctrl + S`.

---

## Bước 7 — Cập nhật `appsettings.Development.json`

Trong **Solution Explorer**, double-click vào **`appsettings.Development.json`**.

File này cũng được commit vào Git — chỉ đặt cấu hình non-sensitive:

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

> **`Microsoft.EntityFrameworkCore.Database.Command: Information`** — bật log SQL queries ra console khi chạy local. Giúp debug dễ hơn nhiều, thấy được EF Core đang generate SQL gì.

Lưu file: `Ctrl + S`.

---

## Bước 7B — Cài credentials local bằng User Secrets

**User Secrets** là cơ chế của .NET để lưu secrets **ngoài repo**, trong thư mục riêng trên máy (`%APPDATA%\Microsoft\UserSecrets\`). File này không bao giờ bị commit vào Git dù vô tình.

### Khởi tạo User Secrets cho project

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet user-secrets init --project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
Set UserSecretsId to 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' for MSBuild project '...\Folio.Api.csproj'.
```

### Set connection string

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=folio;Username=sa;Password=A@a123456" --project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
Successfully saved ConnectionStrings:DefaultConnection = Host=localhost;... to the secret store.
```

### Kiểm tra

```bash
dotnet user-secrets list --project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
ConnectionStrings:DefaultConnection = Host=localhost;Port=5432;Database=folio;Username=sa;Password=A@a123456
```

> **Hoạt động như thế nào?** .NET config system có thứ tự ưu tiên: `appsettings.json` → `appsettings.Development.json` → **User Secrets** → **Environment Variables**. Nguồn sau ghi đè nguồn trước. User Secrets chỉ active khi `ASPNETCORE_ENVIRONMENT=Development` (mặc định khi chạy local qua VS hoặc `dotnet run`).

---

## Tham khảo — Environment Variables cho production/Docker

Khi deploy, inject connection string qua environment variable (không cần User Secrets):

```
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=folio;Username=sa;Password=A@a123456
```

> **`__` (double underscore):** .NET config dùng `__` thay cho `:` trong tên env var. `ConnectionStrings__DefaultConnection` tương đương `ConnectionStrings:DefaultConnection` trong JSON. Đây là convention chuẩn, hoạt động trên cả Linux và Windows.

---

## Bước 8 — Cập nhật `Program.cs`

Trong **Solution Explorer**, double-click vào **`Program.cs`** trong project `Folio.Api`.

Thêm dòng `AddInfrastructure` vào sau `AddControllers()`:

```csharp
using Folio.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);  // ← thêm dòng này

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

> **`using Folio.Infrastructure;`** cần thêm ở đầu file để trình biên dịch tìm thấy extension method `AddInfrastructure`.

Lưu file: `Ctrl + S`.

---

## Bước 9 — Kiểm tra build

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
| `The type or namespace 'IAppDbContext' could not be found` | Thiếu `using` hoặc sai namespace | Kiểm tra namespace trong `IAppDbContext.cs` là `Folio.Application.Common.Interfaces` |
| `'AppDbContext' does not implement interface member 'SaveChangesAsync'` | Chưa override `SaveChangesAsync` | Xem lại Bước 4 |
| `Connection string 'DefaultConnection' not found` | Thiếu key trong appsettings | Kiểm tra lại Bước 6–7 |

---

## Kết quả sau bước này

```
api/src/
├── Folio.Application/
│   └── Common/Interfaces/
│       └── IAppDbContext.cs       ✓
├── Folio.Infrastructure/
│   ├── Persistence/
│   │   └── AppDbContext.cs        ✓
│   └── DependencyInjection.cs     ✓
└── Folio.Api/
    ├── Program.cs                 ✓ (đã thêm AddInfrastructure)
    ├── appsettings.json           ✓ (đã thêm ConnectionStrings)
    └── appsettings.Development.json ✓ (credentials dev local)
```

---

**Tiếp theo:** [04-docker-postgres-local.md](04-docker-postgres-local.md) — Chạy PostgreSQL local bằng Docker Compose, kiểm tra kết nối, tạo migration đầu tiên.
