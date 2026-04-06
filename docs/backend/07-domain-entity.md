# Backend — Bước 7: Domain Entity Đầu Tiên

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo entity `Project` trong `Folio.Domain`, cấu hình với EF Core trong `Folio.Infrastructure`, thêm `DbSet`, tạo và apply migration mới.
> **Yêu cầu:** Đã hoàn thành Bước 1–6.

---

## Tổng quan — sẽ tạo gì

```
api/src/
├── Folio.Domain/
│   └── Entities/
│       └── Project.cs                          ← entity thuần, không có EF Core dependency
└── Folio.Infrastructure/
    └── Persistence/
        ├── Configurations/
        │   └── ProjectConfiguration.cs         ← IEntityTypeConfiguration<Project>
        └── AppDbContext.cs                      ← thêm DbSet<Project>
api/src/Folio.Application/
    └── Common/Interfaces/
        └── IAppDbContext.cs                    ← thêm DbSet<Project>
```

Sau khi xong: table `Projects` xuất hiện trong PostgreSQL sau khi apply migration.

---

## Bước 1 — Tạo thư mục `Entities/` trong `Folio.Domain`

Trong **Visual Studio 2026**, mở **Solution Explorer** (`Ctrl + Alt + L`).

1. Click chuột phải vào project **`Folio.Domain`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Entities` → nhấn `Enter`

---

## Bước 2 — Tạo file `Project.cs`

1. Click chuột phải vào folder **`Entities`** vừa tạo
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `Project.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
namespace Folio.Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Url { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

Lưu file: `Ctrl + S`.

> **Không có EF Core `using`:** `Folio.Domain` không được phụ thuộc vào EF Core — entity là POCO thuần. EF Core mapping được đặt hoàn toàn ở `Folio.Infrastructure`.
>
> **`Id` convention:** EF Core tự nhận diện property tên `Id` hoặc `ProjectId` là primary key — không cần annotation `[Key]`.
>
> **`string.Empty` thay vì `null`:** Tránh nullable warning khi build. Property `Url` là nullable vì không phải project nào cũng có link.

---

## Bước 3 — Tạo thư mục `Configurations/` trong `Folio.Infrastructure/Persistence/`

Trong **Solution Explorer**:

1. Mở rộng project **`Folio.Infrastructure`** → mở rộng folder **`Persistence`**
2. Click chuột phải vào **`Persistence`** → **Add** → **New Folder**
3. Đặt tên `Configurations` → nhấn `Enter`

---

## Bước 4 — Tạo file `ProjectConfiguration.cs`

1. Click chuột phải vào folder **`Configurations`**
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `ProjectConfiguration.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using Folio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Folio.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(p => p.Url)
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .IsRequired();
    }
}
```

Lưu file: `Ctrl + S`.

> **`IEntityTypeConfiguration<Project>`:** Pattern chuẩn — tách cấu hình từng entity ra class riêng thay vì nhồi hết vào `OnModelCreating`. `AppDbContext` đã có `ApplyConfigurationsFromAssembly()` — class này sẽ được tự động load.
>
> **`IsRequired()` / `HasMaxLength()`:** Fluent API để khai báo constraints. `IsRequired()` = NOT NULL trong SQL; `HasMaxLength()` = VARCHAR(n).

---

## Bước 5 — Thêm `DbSet<Project>` vào `IAppDbContext`

Trong **Solution Explorer** → mở rộng `Folio.Application` → `Common` → `Interfaces` → double-click **`IAppDbContext.cs`**.

Thêm `using` và `DbSet<Project>`:

```csharp
using Folio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Folio.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Project> Projects { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

Lưu file: `Ctrl + S`.

> **Tại sao `IAppDbContext` cần `DbSet`?** Use cases trong Application layer cần truy cập `Projects` để query/command — nhưng chỉ qua interface, không qua EF Core trực tiếp. Đây là lý do `using Microsoft.EntityFrameworkCore` xuất hiện ở đây: `DbSet<T>` là kiểu dữ liệu cần thiết cho interface, dù Application không implement EF Core.

---

## Bước 6 — Thêm `DbSet<Project>` vào `AppDbContext`

Trong **Solution Explorer** → mở rộng `Folio.Infrastructure` → `Persistence` → double-click **`AppDbContext.cs`**.

Thêm `using` và `DbSet<Project>`:

```csharp
using Folio.Application.Common.Interfaces;
using Folio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Folio.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }
}
```

Lưu file: `Ctrl + S`.

> **`=> Set<Project>()`:** Cú pháp expression body. `Set<Project>()` là cách EF Core lấy `DbSet` cho một entity type — tương đương với `DbSet<Project>` property thông thường nhưng gọn hơn.

---

## Bước 7 — Kiểm tra build

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
| `'AppDbContext' does not implement interface member 'DbSet<Project> Projects'` | Chưa thêm `DbSet` vào `AppDbContext` | Xem lại Bước 6 |
| `The type or namespace 'Project' could not be found` | Thiếu `using Folio.Domain.Entities` | Kiểm tra dòng `using` đầu file |

---

## Bước 8 — Tạo migration mới

Đảm bảo PostgreSQL container đang chạy:

```bash
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db
```

Từ thư mục `api/`, tạo migration:

```bash
dotnet ef migrations add AddProjectEntity \
  --project src/Folio.Infrastructure/Folio.Infrastructure.csproj \
  --startup-project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

Trong **Solution Explorer** → mở rộng `Folio.Infrastructure` → `Persistence` → `Migrations` — phải thấy file mới `YYYYMMDDHHMMSS_AddProjectEntity.cs`.

Mở file đó ra, kiểm tra có `CreateTable(name: "Projects", ...)` bên trong `Up()`.

---

## Bước 9 — Apply migration

```bash
dotnet ef database update \
  --project src/Folio.Infrastructure/Folio.Infrastructure.csproj \
  --startup-project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
Build started...
Build succeeded.
Applying migration 'YYYYMMDDHHMMSS_AddProjectEntity'.
Done.
```

---

## Bước 10 — Xác nhận trong PgAdmin

Trong **PgAdmin** → mở rộng **folio-dev** → **Databases** → **folio** → **Schemas** → **public** → **Tables**.

Click chuột phải vào **Tables** → **Refresh**.

Phải thấy table **`Projects`** mới bên cạnh `__EFMigrationsHistory`.

Click chuột phải vào **`Projects`** → **Properties** → tab **Columns** — phải thấy đủ 5 cột: `Id`, `Title`, `Description`, `Url`, `CreatedAt`.

---

## Kết quả sau bước này

```
api/src/
├── Folio.Domain/Entities/
│   └── Project.cs                              ✓
└── Folio.Infrastructure/Persistence/
    ├── Configurations/
    │   └── ProjectConfiguration.cs             ✓
    └── AppDbContext.cs                          ✓ (có DbSet<Project>)
```

**Database:** Table `Projects` đã tồn tại trong PostgreSQL.

---

**Tiếp theo:** [08-crud-endpoint.md](08-crud-endpoint.md) — Tạo CRUD endpoints cho `Project` — `GET`, `POST`, `PUT`, `DELETE`.
