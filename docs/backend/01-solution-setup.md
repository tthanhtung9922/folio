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

## Bước 2 — Pin SDK version bằng `global.json`

Vẫn đang ở `api/`, chạy:

```bash
dotnet new globaljson --sdk-version 10.0.100 --roll-forward latestMinor
```

> **Tại sao cần bước này?** Khi máy cài nhiều phiên bản .NET, `global.json` đảm bảo project luôn dùng đúng SDK bất kể SDK nào được cài sau. `latestMinor` cho phép dùng patch release mới hơn (ví dụ `10.0.101`) nhưng không nhảy lên `10.1.x`.

Output kỳ vọng:

```
The template "global.json file" was created successfully.
```

---

## Bước 3 — Tạo `.gitignore` cho .NET

Vẫn đang ở `api/`:

```bash
dotnet new gitignore
```

Lệnh này tạo file `.gitignore` chuẩn của Microsoft cho .NET — tự động bỏ qua các thư mục `bin/`, `obj/`, `.vs/`, `*.user`, v.v. Không cần chỉnh sửa gì thêm.

---

## Bước 4 — Tạo Solution

Vẫn đang ở `api/`:

```bash
dotnet new sln -n Folio
```

Output kỳ vọng:

```
The template "Solution File" was created successfully.
```

Lúc này có file `api/Folio.sln`.

---

## Bước 5 — Tạo 4 Projects

Chạy lần lượt từng lệnh, vẫn đang ở `api/`:

```bash
dotnet new webapi -n Folio.Api -o src/Folio.Api --use-controllers
dotnet new classlib -n Folio.Application -o src/Folio.Application
dotnet new classlib -n Folio.Domain -o src/Folio.Domain
dotnet new classlib -n Folio.Infrastructure -o src/Folio.Infrastructure
```

> **Lưu ý `--use-controllers`:** Từ .NET 8 trở đi, `dotnet new webapi` mặc định tạo project kiểu **Minimal APIs** (không có Controllers folder). Flag `--use-controllers` bật lại mô hình Controllers truyền thống — phù hợp với Clean Architecture vì cho phép tách rõ routing, DI, và business logic.

> **OpenAPI mặc định bật:** Template `webapi` trong .NET 9/10 tích hợp sẵn **Scalar UI** (thay thế Swagger UI) để test API. Truy cập tại `http://localhost:5000/scalar` sau khi chạy.

Vai trò từng project:

| Project | Vai trò |
|---|---|
| `Folio.Api` | Entry point — controllers, middleware, DI config |
| `Folio.Application` | Use cases, interfaces, DTOs |
| `Folio.Domain` | Entities, value objects, domain logic — không phụ thuộc gì cả |
| `Folio.Infrastructure` | EF Core, PostgreSQL, implementations của interfaces |

---

## Bước 6 — Add tất cả vào Solution

Trong .NET 9+, `dotnet sln add` hỗ trợ nhiều file cùng lúc. Vẫn đang ở `api/`:

```bash
dotnet sln Folio.sln add src/Folio.Api/Folio.Api.csproj src/Folio.Application/Folio.Application.csproj src/Folio.Domain/Folio.Domain.csproj src/Folio.Infrastructure/Folio.Infrastructure.csproj
```

Output kỳ vọng (4 dòng):

```
Project `src/Folio.Api/Folio.Api.csproj` added to the solution.
Project `src/Folio.Application/Folio.Application.csproj` added to the solution.
Project `src/Folio.Domain/Folio.Domain.csproj` added to the solution.
Project `src/Folio.Infrastructure/Folio.Infrastructure.csproj` added to the solution.
```

---

## Bước 7 — Add Project References

Luật DDD: dependency chỉ đi vào trong — `Domain` không biết gì về `Application` hay `Infrastructure`.

```
Api ──────► Application ──► Domain
 │                           ▲
 └──────► Infrastructure ────┘
```

Chạy lần lượt từng lệnh (vẫn ở `api/`):

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

## Bước 8 — Mở Solution trong Visual Studio 2026

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

Để xác nhận project references đúng: trong Solution Explorer, click mũi tên mở rộng bên cạnh `Folio.Api` → mở rộng mục **Dependencies** → **Projects** — phải thấy `Folio.Application` và `Folio.Infrastructure`.

---

## Bước 9 — Kiểm tra build

Trong Terminal, từ thư mục `api/`:

```bash
dotnet build Folio.sln
```

Output kỳ vọng:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:XX.XX
```

Nếu có lỗi, paste nội dung lỗi ra để được hướng dẫn tiếp.

---

## Kết quả sau bước này

```
folio/
└── api/
    ├── .gitignore
    ├── global.json
    ├── Folio.sln
    └── src/
        ├── Folio.Api/
        ├── Folio.Application/
        ├── Folio.Domain/
        └── Folio.Infrastructure/
```

---

**Tiếp theo:** [02-nuget-efcore-postgres.md](02-nuget-efcore-postgres.md) — Cài NuGet packages, setup EF Core + PostgreSQL.
