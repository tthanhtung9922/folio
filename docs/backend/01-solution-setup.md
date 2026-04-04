# Backend — Bước 1: Tạo Solution và Projects

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo `api/` với solution `.NET 10`, 4 projects theo Clean Architecture, project references đúng dependency graph.

---

## Chuẩn bị

Xác nhận các tool đã cài trước khi bắt đầu:

**Visual Studio 2026** — cần có workload **ASP.NET and web development**:
1. Mở **Visual Studio Installer** (tìm trong Start Menu)
2. Bấm **Modify** bên cạnh VS 2026
3. Tab **Workloads** → tick **ASP.NET and web development**
4. Bấm **Modify** (góc dưới phải) → chờ cài xong

**.NET 10 SDK** — kiểm tra bằng cách mở **Windows Terminal** và chạy:

```bash
dotnet --version
```

Output phải là `10.x.x`. Nếu chưa có, tải tại https://dot.net/download.

---

## Bước 1 — Tạo thư mục `api/`

Mở **Windows Terminal**, chạy từ thư mục gốc repo:

```bash
cd d:\Dev\Projects\Personal\folio
mkdir api
cd api
```

---

## Bước 2 — Tạo Solution

Vẫn đang ở `d:\Dev\Projects\Personal\folio\api\`:

```bash
dotnet new sln -n Folio
```

Output kỳ vọng:

```
The template "Solution File" was created successfully.
```

Lúc này có file `api/Folio.sln`.

---

## Bước 3 — Tạo 4 Projects

Chạy lần lượt từng lệnh, vẫn đang ở `api/`:

```bash
dotnet new webapi -n Folio.Api --no-openapi false -o src/Folio.Api
dotnet new classlib -n Folio.Application -o src/Folio.Application
dotnet new classlib -n Folio.Domain -o src/Folio.Domain
dotnet new classlib -n Folio.Infrastructure -o src/Folio.Infrastructure
```

Vai trò từng project:

| Project | Vai trò |
|---|---|
| `Folio.Api` | Entry point — controllers, middleware, DI config |
| `Folio.Application` | Use cases, interfaces, DTOs |
| `Folio.Domain` | Entities, value objects, domain logic — không phụ thuộc gì cả |
| `Folio.Infrastructure` | EF Core, PostgreSQL, implementations của interfaces |

---

## Bước 4 — Add tất cả vào Solution

```bash
dotnet sln Folio.sln add src/Folio.Api/Folio.Api.csproj
dotnet sln Folio.sln add src/Folio.Application/Folio.Application.csproj
dotnet sln Folio.sln add src/Folio.Domain/Folio.Domain.csproj
dotnet sln Folio.sln add src/Folio.Infrastructure/Folio.Infrastructure.csproj
```

Output mỗi lệnh:

```
Project `src/Folio.Api/Folio.Api.csproj` added to the solution.
```

---

## Bước 5 — Add Project References

Luật DDD: dependency chỉ đi vào trong — `Domain` không biết gì về `Application` hay `Infrastructure`.

```
Api ──────► Application ──► Domain
 │                           ▲
 └──────► Infrastructure ────┘
```

Chạy lần lượt:

```bash
# Api → Application
dotnet add src/Folio.Api/Folio.Api.csproj reference src/Folio.Application/Folio.Application.csproj

# Api → Infrastructure
dotnet add src/Folio.Api/Folio.Api.csproj reference src/Folio.Infrastructure/Folio.Infrastructure.csproj

# Application → Domain
dotnet add src/Folio.Application/Folio.Application.csproj reference src/Folio.Domain/Folio.Domain.csproj

# Infrastructure → Application
dotnet add src/Folio.Infrastructure/Folio.Infrastructure.csproj reference src/Folio.Application/Folio.Application.csproj

# Infrastructure → Domain
dotnet add src/Folio.Infrastructure/Folio.Infrastructure.csproj reference src/Folio.Domain/Folio.Domain.csproj
```

Output mỗi lệnh:

```
Reference `..\Folio.Domain\Folio.Domain.csproj` added to the project.
```

---

## Bước 6 — Mở Solution trong Visual Studio 2026

Trong Terminal (vẫn ở `api/`):

```bash
start Folio.sln
```

Visual Studio sẽ mở tự động. Nếu không thấy **Solution Explorer**:
- Menu **View** (thanh menu trên cùng) → **Solution Explorer**
- Hoặc phím tắt: `Ctrl + Alt + L`

Cấu trúc kỳ vọng trong Solution Explorer:

```
Solution 'Folio' (4 projects)
└── src
    ├── Folio.Api
    ├── Folio.Application
    ├── Folio.Domain
    └── Folio.Infrastructure
```

---

## Bước 7 — Kiểm tra build

Trong Terminal:

```bash
dotnet build
```

Output kỳ vọng:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Nếu có lỗi, paste nội dung lỗi ra để được hướng dẫn tiếp.

---

## Kết quả sau bước này

```
folio/
└── api/
    ├── Folio.sln
    └── src/
        ├── Folio.Api/
        ├── Folio.Application/
        ├── Folio.Domain/
        └── Folio.Infrastructure/
```

---

**Tiếp theo:** [02-nuget-efcore-postgres.md](02-nuget-efcore-postgres.md) — Cài NuGet packages, setup EF Core + PostgreSQL.
