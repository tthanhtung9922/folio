# Backend — Bước 7: DDD Common Base + Domain Entity Đầu Tiên

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Thiết lập DDD common base classes trong `Folio.Domain/Common/`, tạo aggregate đầu tiên (`Showcase`), thêm entity `Project`, cấu hình EF Core, tạo và apply migration mới.
> **Yêu cầu:** Đã hoàn thành Bước 1–6.

---

## Tại sao cần DDD Common base classes?

Architecture của Folio (xem `docs/overview/03-folio-architecture.md`) tổ chức Domain theo **bounded contexts / aggregates** với một `Common/` chứa base classes dùng chung:

```
Folio.Domain/
├── Common/              ← Entity, IAggregateRoot, IDomainEvent, ValueObject, Result
├── Showcase/            ← Project aggregate
├── Blog/                ← Post, TilEntry, ChangelogEntry aggregates
└── Journal/             ← DecisionRecord aggregate
```

Không dùng generic flat folder (`Entities/`, `Repositories/`) — mỗi folder = một bounded context.

**Tại sao Entity base class phức tạp hơn một POCO thuần?**

Một `Entity` trong DDD cần 3 thứ mà POCO không có:

1. **Equality dựa trên Id, không phải reference** — hai `Project` objects khác nhau trong bộ nhớ nhưng cùng `Id` phải được coi là bằng nhau.
2. **Domain Events** — entity cần khả năng "phát tín hiệu" khi có điều gì đó quan trọng xảy ra (ví dụ: `ProjectCreated`), để các layer khác react mà không cần entity biết về chúng.
3. **`Id` có `protected set`** — chỉ entity tự set `Id` của mình, bên ngoài không được phép gán thẳng.

---

## Tổng quan — sẽ tạo gì

```
api/src/
├── Folio.Domain/
│   ├── Common/
│   │   ├── IDomainEvent.cs                         ← interface thuần, không có EF/MediatR dependency
│   │   ├── Entity.cs                               ← abstract base: Id, equality, domain events
│   │   └── IAggregateRoot.cs                       ← marker interface
│   └── Showcase/
│       └── Project.cs                              ← entity kế thừa Entity + IAggregateRoot
└── Folio.Infrastructure/
    └── Persistence/
        ├── Configurations/
        │   └── ProjectConfiguration.cs             ← IEntityTypeConfiguration<Project>
        └── AppDbContext.cs                          ← thêm DbSet<Project>
api/src/Folio.Application/
    └── Common/Interfaces/
        └── IAppDbContext.cs                        ← thêm DbSet<Project>
```

---

## Phần A — DDD Common base classes

### Bước 1 — Tạo thư mục `Common/` trong `Folio.Domain`

Trong **Visual Studio 2026**, mở **Solution Explorer** (`Ctrl + Alt + L`).

1. Click chuột phải vào project **`Folio.Domain`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Common` → nhấn `Enter`

---

### Bước 2 — Tạo file `IDomainEvent.cs`

1. Click chuột phải vào folder **`Common`**
2. Chọn **Add** → **New Item...**
3. Chọn **Interface**
4. Đặt tên `IDomainEvent.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
namespace Folio.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
```

Lưu file: `Ctrl + S`.

> **Không có `using MediatR` hay `using Mediator`** — Domain layer phải hoàn toàn độc lập. Sau này khi Application layer cần dispatch domain events qua MediatR, nó sẽ wrap `IDomainEvent` thành `INotification` — không cần Domain biết gì về MediatR.
>
> **`OccurredOn`:** Thời điểm event xảy ra — hữu ích cho audit log, event sourcing, hay debugging. Khi implement một domain event cụ thể, gán bằng `DateTime.UtcNow` trong constructor.

---

### Bước 3 — Tạo file `IAggregateRoot.cs`

1. Click chuột phải vào folder **`Common`**
2. Chọn **Add** → **New Item...**
3. Chọn **Interface**
4. Đặt tên `IAggregateRoot.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
namespace Folio.Domain.Common;

/// <summary>
/// Marker interface — chỉ Aggregate Root mới được có Repository riêng.
/// </summary>
public interface IAggregateRoot { }
```

Lưu file: `Ctrl + S`.

> **Marker interface (không có method):** Mục đích duy nhất là đánh dấu. Khi tạo generic repository sau này, constraint `where T : IAggregateRoot` đảm bảo chỉ aggregate roots mới có repository — child entities không có.
>
> **Aggregate Root là gì?** Trong DDD, một aggregate là một cụm objects được xử lý như một đơn vị. Aggregate Root là entry point duy nhất — bên ngoài chỉ được tương tác qua root, không được trực tiếp modify child entities. Ví dụ: `Project` là root; nếu sau này có `ProjectImage` là child entity, code bên ngoài phải gọi `project.AddImage(...)` thay vì tự tạo và lưu `ProjectImage`.

---

### Bước 4 — Tạo file `Entity.cs`

1. Click chuột phải vào folder **`Common`**
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `Entity.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using System.ComponentModel.DataAnnotations.Schema;

namespace Folio.Domain.Common;

public abstract class Entity
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public int Id { get; protected set; }

    [NotMapped]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent) =>
        _domainEvents.Add(domainEvent);

    public void ClearDomainEvents() => _domainEvents.Clear();

    public bool IsTransient() => Id == 0;

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other) return false;
        if (ReferenceEquals(this, other)) return true;
        if (GetType() != other.GetType()) return false;
        if (IsTransient() || other.IsTransient()) return false;
        return Id == other.Id;
    }

    public override int GetHashCode() =>
        IsTransient()
            ? base.GetHashCode()
            : GetType().GetHashCode() ^ Id.GetHashCode();

    public static bool operator ==(Entity? left, Entity? right) =>
        left is null ? right is null : left.Equals(right);

    public static bool operator !=(Entity? left, Entity? right) => !(left == right);
}
```

Lưu file: `Ctrl + S`.

> **`protected set` trên `Id`:** Chỉ entity tự set Id của mình (hoặc EF Core qua reflection). Code bên ngoài không được phép gán `project.Id = 5`.
>
> **`[NotMapped]`:** Từ `System.ComponentModel.DataAnnotations.Schema` — có sẵn trong .NET SDK, không cần cài thêm package nào. Thuộc tính này báo EF Core bỏ qua property `DomainEvents`, không map vào database.
>
> **`IsTransient()`:** Entity chưa được lưu vào database có `Id == 0`. Method này dùng trong Equals để tránh so sánh nhầm hai objects chưa persist với nhau.
>
> **Equality pattern:** Hai entities cùng loại, cùng `Id` khác 0 → bằng nhau. Tránh dùng reference equality (`ReferenceEquals`) khi làm việc với detached entities (ví dụ: load từ 2 DbContext riêng).
>
> **`_domainEvents = []`:** Collection initializer syntax (C# 12) — tương đương `new List<IDomainEvent>()`. Events được thêm qua `protected AddDomainEvent()` bên trong entity methods, và được xóa bởi Infrastructure sau khi dispatch.

---

## Phần B — Showcase Aggregate

### Bước 5 — Tạo thư mục `Showcase/` trong `Folio.Domain`

Trong **Solution Explorer**:

1. Click chuột phải vào project **`Folio.Domain`**
2. Chọn **Add** → **New Folder**
3. Đặt tên `Showcase` → nhấn `Enter`

> **Tại sao `Showcase/` chứ không phải `Entities/`?** DDD tổ chức theo business domain. `Showcase/` là bounded context chứa tất cả những gì liên quan đến portfolio projects. Khi thêm `Blog/` hay `Journal/` sau này, chỉ cần thêm folder tương ứng.

---

### Bước 6 — Tạo file `Project.cs`

1. Click chuột phải vào folder **`Showcase`**
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `Project.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using Folio.Domain.Common;

namespace Folio.Domain.Showcase;

public class Project : Entity, IAggregateRoot
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? Url { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Constructor rỗng cho EF Core — không được dùng trực tiếp
    private Project() { }

    public static Project Create(string title, string description, string? url = null)
    {
        return new Project
        {
            Title = title,
            Description = description,
            Url = url,
            CreatedAt = DateTime.UtcNow,
        };
    }
}
```

Lưu file: `Ctrl + S`.

> **`private set` trên tất cả properties:** Bên ngoài entity không được tự ý thay đổi state. Mọi thay đổi phải đi qua method của entity (ví dụ: `project.Update(title, description)` sẽ thêm sau). Đây là **encapsulation trong DDD** — entity tự bảo vệ invariants của mình.
>
> **`private Project() { }`:** EF Core cần constructor không tham số để instantiate object khi đọc từ database. Để `private` ngăn code khác tạo instance trực tiếp.
>
> **`static Create()`:** Factory method thay thế public constructor. Tên method nói lên intention (`Create` vs `new`), và sau này có thể thêm validation hoặc raise `ProjectCreatedEvent` tại đây mà không làm phức tạp constructor.
>
> **`IAggregateRoot`:** `Project` là aggregate root của bounded context `Showcase` — entry point duy nhất khi tương tác với dữ liệu showcase.

---

## Phần C — Infrastructure & Application

### Bước 7 — Tạo thư mục `Configurations/` trong `Folio.Infrastructure/Persistence/`

Trong **Solution Explorer**:

1. Mở rộng project **`Folio.Infrastructure`** → mở rộng folder **`Persistence`**
2. Click chuột phải vào **`Persistence`** → **Add** → **New Folder**
3. Đặt tên `Configurations` → nhấn `Enter`

---

### Bước 8 — Tạo file `ProjectConfiguration.cs`

1. Click chuột phải vào folder **`Configurations`**
2. Chọn **Add** → **New Item...**
3. Chọn **Class**
4. Đặt tên `ProjectConfiguration.cs` → click **Add**

Xóa nội dung mặc định, nhập:

```csharp
using Folio.Domain.Showcase;
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

> **`IEntityTypeConfiguration<Project>`:** Tách cấu hình từng entity ra class riêng. `AppDbContext` đã có `ApplyConfigurationsFromAssembly()` — class này tự động được load.
>
> **Không cần `Ignore(p => p.DomainEvents)`:** `[NotMapped]` trên property trong `Entity.cs` đã đủ để EF Core bỏ qua.

---

### Bước 9 — Cài `Microsoft.EntityFrameworkCore` cho `Folio.Application`

`IAppDbContext` sẽ expose `DbSet<Project>` — đây là kiểu của EF Core. Application layer không implement EF Core, nhưng cần tham chiếu đến kiểu `DbSet<T>` để định nghĩa interface. Vì vậy cần cài package EF Core core (không phải provider) vào project này.

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet add src/Folio.Application/Folio.Application.csproj package Microsoft.EntityFrameworkCore --version 10.0.5
```

Output kỳ vọng:

```
info : PackageReference for package 'Microsoft.EntityFrameworkCore' version '10.0.5' added to file '...\Folio.Application.csproj'.
```

> **Tại sao Application cần EF Core?** Chỉ cần `Microsoft.EntityFrameworkCore` (abstractions + `DbSet<T>` type) — không cài provider (`Npgsql`) hay migrations. Application layer định nghĩa *contract* qua `DbSet<T>`, Infrastructure mới implement. Đây là cách phổ biến nhất trong Clean Architecture DDD (kể cả trong tài liệu Microsoft và ardalis template).

---

### Bước 10 — Thêm `DbSet<Project>` vào `IAppDbContext`

Trong **Solution Explorer** → mở rộng `Folio.Application` → `Common` → `Interfaces` → double-click **`IAppDbContext.cs`**.

Thêm `using` và `DbSet<Project>`:

```csharp
using Folio.Domain.Showcase;
using Microsoft.EntityFrameworkCore;

namespace Folio.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Project> Projects { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

Lưu file: `Ctrl + S`.

---

### Bước 11 — Thêm `DbSet<Project>` vào `AppDbContext`

Trong **Solution Explorer** → mở rộng `Folio.Infrastructure` → `Persistence` → double-click **`AppDbContext.cs`**.

Thêm `using` và `DbSet<Project>`:

```csharp
using Folio.Application.Common.Interfaces;
using Folio.Domain.Showcase;
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
| `'AppDbContext' does not implement interface member 'DbSet<Project> Projects'` | Chưa thêm `DbSet` vào `AppDbContext` | Xem lại Bước 11 |
| `The type or namespace 'DbSet' could not be found` | Chưa cài EF Core vào Application | Chạy lại Bước 9 |
| `The type or namespace 'Project' could not be found` | Thiếu `using Folio.Domain.Showcase` | Kiểm tra dòng `using` đầu file |
| `The type or namespace 'Entity' could not be found` | Thiếu `using Folio.Domain.Common` trong `Project.cs` | Kiểm tra dòng `using` đầu file |

---

## Bước 13 — Tạo migration mới

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

Mở file đó ra, xác nhận có `CreateTable(name: "Projects", ...)` trong `Up()`.

---

## Bước 14 — Apply migration

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

## Bước 15 — Xác nhận trong PgAdmin

Trong **PgAdmin** → mở rộng **folio-dev** → **Databases** → **folio** → **Schemas** → **public** → **Tables**.

Click chuột phải vào **Tables** → **Refresh**.

Phải thấy table **`Projects`** mới bên cạnh `__EFMigrationsHistory`.

Click chuột phải vào **`Projects`** → **Properties** → tab **Columns** — phải thấy đủ 5 cột: `Id`, `Title`, `Description`, `Url`, `CreatedAt`.

---

## Kết quả sau bước này

```
api/src/
├── Folio.Domain/
│   ├── Common/
│   │   ├── IDomainEvent.cs                         ✓
│   │   ├── Entity.cs                               ✓ (Id protected, equality, domain events)
│   │   └── IAggregateRoot.cs                       ✓ (marker interface)
│   └── Showcase/
│       └── Project.cs                              ✓ (Entity + IAggregateRoot, private setters, factory)
└── Folio.Infrastructure/Persistence/
    ├── Configurations/
    │   └── ProjectConfiguration.cs                 ✓
    └── AppDbContext.cs                              ✓ (có DbSet<Project>)
```

**Database:** Table `Projects` đã tồn tại trong PostgreSQL.

**Package distribution cập nhật:**

| Project | Packages |
|---|---|
| `Folio.Domain` | _(không có)_ |
| `Folio.Application` | `Microsoft.EntityFrameworkCore 10.0.5` |
| `Folio.Infrastructure` | `Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1`, `Microsoft.EntityFrameworkCore.Design 10.0.5`, `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore 10.0.5` |
| `Folio.Api` | `Microsoft.EntityFrameworkCore.Design 10.0.5`, `DotNetEnv 3.1.1`, `Microsoft.AspNetCore.OpenApi 10.0.5`, `Scalar.AspNetCore 2.13.20` |

---

**Tiếp theo:** [08-crud-endpoint.md](08-crud-endpoint.md) — Tạo CRUD endpoints cho `Project` — `GET`, `POST`, `PUT`, `DELETE`.
