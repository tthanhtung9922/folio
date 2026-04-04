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

Trước tiên, xem danh sách SDK đang cài trên máy:

```bash
dotnet --list-sdks
```

Output ví dụ:

```
10.0.201 [C:\Program Files\dotnet\sdk]
```

Lấy version đầy đủ từ output đó (ví dụ `10.0.201`), sau đó chạy:

```bash
dotnet new globaljson --sdk-version 10.0.201 --roll-forward latestPatch
```

> **Tại sao cần bước này?** Khi máy cài nhiều phiên bản .NET, `global.json` đảm bảo project luôn dùng đúng SDK. `latestPatch` cho phép dùng patch release mới hơn trong cùng feature band (ví dụ `10.0.202`) nhưng không nhảy lên feature band khác (`10.0.300`).

> **Lưu ý version:** Thay `10.0.201` bằng version thực tế từ output `dotnet --list-sdks` trên máy bạn. Phải dùng version đầy đủ 3 phần — không được viết `10.0` hay `10`.

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

> **Lưu ý `--use-controllers`:** Từ .NET 8 trở đi, `dotnet new webapi` mặc định tạo project theo kiểu **Minimal APIs**. Flag `--use-controllers` bật lại mô hình Controllers truyền thống — phù hợp với Clean Architecture.

> **OpenAPI + Scalar:** Template `webapi` trong .NET 10 tích hợp sẵn `Microsoft.AspNetCore.OpenApi` và **Scalar UI** để test API. Sau khi chạy, truy cập tại `http://localhost:5000/scalar/v1` (chỉ available ở môi trường Development).

Vai trò từng project:

| Project | Vai trò |
|---|---|
| `Folio.Api` | Entry point — controllers, middleware, DI config |
| `Folio.Application` | Use cases, interfaces, DTOs |
| `Folio.Domain` | Entities, value objects, domain logic — không phụ thuộc gì cả |
| `Folio.Infrastructure` | EF Core, PostgreSQL, implementations của interfaces |

---

## Bước 6 — Xóa các file mẫu không cần thiết

Template `webapi` và `classlib` sinh ra các file placeholder cần xóa trước khi bắt đầu code thật.

Trong **Windows Terminal**, vẫn ở `api/`:

```bash
# Xóa file mẫu của webapi template
rm src/Folio.Api/Controllers/WeatherForecastController.cs
rm src/Folio.Api/WeatherForecast.cs

# Xóa file mẫu của classlib template
rm src/Folio.Application/Class1.cs
rm src/Folio.Domain/Class1.cs
rm src/Folio.Infrastructure/Class1.cs
```

---

## Bước 7 — Add tất cả vào Solution

Vẫn đang ở `api/`:

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

## Bước 8 — Add Project References

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

## Bước 9 — Mở Solution trong Visual Studio 2026

Trong Terminal (vẫn ở `api/`):

```bash
start Folio.sln
```

Visual Studio sẽ mở tự động. Nếu máy cài nhiều phiên bản Visual Studio và file mở sai version: đóng lại, mở **Visual Studio 2026** trực tiếp từ Start Menu → menu **File** → **Open** → **Project/Solution** → chọn file `api/Folio.sln`.

Nếu không thấy **Solution Explorer** sau khi mở:
- Menu **View** → **Solution Explorer**
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

## Bước 10 — Kiểm tra build

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
        │   ├── Controllers/        ← trống (đã xóa WeatherForecastController)
        │   ├── Program.cs
        │   └── Folio.Api.csproj
        ├── Folio.Application/
        │   └── Folio.Application.csproj
        ├── Folio.Domain/
        │   └── Folio.Domain.csproj
        └── Folio.Infrastructure/
            └── Folio.Infrastructure.csproj
```

---

**Tiếp theo:** [02-nuget-efcore-postgres.md](02-nuget-efcore-postgres.md) — Cài NuGet packages, setup EF Core + PostgreSQL.
