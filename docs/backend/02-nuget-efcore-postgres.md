# Backend — Bước 2: Cài NuGet Packages + EF Core + PostgreSQL

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Cài đúng packages vào đúng projects theo Clean Architecture, install dotnet-ef CLI tool.
> **Versions (tháng 3/2026):**
> - `Microsoft.EntityFrameworkCore` / `.Design` / `.Tools` → `10.0.5`
> - `Npgsql.EntityFrameworkCore.PostgreSQL` → `10.0.1`
> - `dotnet-ef` global tool → `10.0.5`

---

## Tại sao phải phân chia packages theo project?

Trong Clean Architecture, mỗi layer chỉ được biết về những gì nó cần. Đây là quy tắc:

```
Domain          — KHÔNG cài bất kỳ EF Core package nào
Application     — KHÔNG cài EF Core (chỉ định nghĩa interfaces thuần)
Infrastructure  — cài EF Core + Npgsql (nơi implement DbContext)
Api             — cài Design package (dotnet ef cần để chạy migrations)
```

> **Lý do `Domain` và `Application` không có EF Core:** Nếu `Domain` phụ thuộc vào EF Core, ta đã gắn chặt business logic vào một ORM cụ thể — vi phạm nguyên tắc Dependency Inversion. `Application` chỉ cần _interface_ của DbContext, không cần implementation.

---

## Bước 1 — Cài `dotnet-ef` global tool

`dotnet-ef` là CLI tool để chạy các lệnh migrations (`add`, `update`, `list`, v.v.). Chỉ cần cài một lần trên máy.

Mở **Windows Terminal**, chạy từ bất kỳ thư mục nào:

```bash
dotnet tool install --global dotnet-ef
```

Nếu đã cài trước đó và muốn cập nhật lên version mới nhất:

```bash
dotnet tool update --global dotnet-ef
```

Kiểm tra cài đặt thành công:

```bash
dotnet ef --version
```

Output kỳ vọng:

```
Entity Framework Core .NET Command-line Tools
10.0.5
```

---

## Bước 2 — Cài packages cho `Folio.Infrastructure`

`Folio.Infrastructure` là nơi đặt `AppDbContext` và tất cả EF Core logic. Cần 2 packages:

Trong **Windows Terminal**, `cd` vào thư mục `api/`:

```bash
cd d:\Dev\Projects\Personal\folio\api
```

Cài packages:

```bash
# EF Core provider cho PostgreSQL (tự động kéo theo EF Core core + Relational)
dotnet add src/Folio.Infrastructure/Folio.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.1

# Design-time tools — cần thiết để dotnet ef đọc được DbContext khi chạy migrations
dotnet add src/Folio.Infrastructure/Folio.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Design --version 10.0.5
```

> **Lưu ý `Microsoft.EntityFrameworkCore.Design`:** Package này có attribute `<PrivateAssets>all</PrivateAssets>` trong csproj — nghĩa là nó chỉ dùng lúc build/design time, không bị đóng gói vào output cuối. Đây là behavior đúng, không cần lo.

Output kỳ vọng mỗi lệnh:

```
  Determining projects to restore...
  Writing ...
info : PackageReference for package 'Npgsql.EntityFrameworkCore.PostgreSQL' version '10.0.1' added to file '...\Folio.Infrastructure.csproj'.
```

---

## Bước 3 — Cài packages cho `Folio.Api`

`Folio.Api` là startup project — nơi `dotnet ef` sẽ tìm connection string và khởi động app để chạy migrations. Cần thêm `Microsoft.EntityFrameworkCore.Design` ở đây:

```bash
dotnet add src/Folio.Api/Folio.Api.csproj package Microsoft.EntityFrameworkCore.Design --version 10.0.5
```

> **Tại sao Api cũng cần Design?** Khi chạy `dotnet ef migrations add`, tool sẽ build và khởi động startup project (`Folio.Api`) để discover DbContext. Nếu startup project không có Design package, lệnh sẽ báo lỗi `Unable to create an object of type 'AppDbContext'`.

---

## Bước 4 — Xác nhận packages trong Visual Studio 2026

Mở **Solution Explorer** → click chuột phải vào project `Folio.Infrastructure` → chọn **Manage NuGet Packages...**.

Trong cửa sổ NuGet hiện ra:
1. Click tab **Installed** (góc trên trái của cửa sổ NuGet)
2. Phải thấy danh sách gồm:
   - `Microsoft.EntityFrameworkCore` (được kéo tự động bởi Npgsql)
   - `Microsoft.EntityFrameworkCore.Design`
   - `Microsoft.EntityFrameworkCore.Relational` (được kéo tự động)
   - `Npgsql.EntityFrameworkCore.PostgreSQL`
   - `Npgsql` (được kéo tự động)

Đóng cửa sổ NuGet.

---

## Bước 5 — Kiểm tra build

Trong Terminal, từ thư mục `api/`:

```bash
dotnet build Folio.slnx
```

Output kỳ vọng:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Nếu thấy warning kiểu `The package 'X' was restored using '.NETFramework'` — bỏ qua, không ảnh hưởng.

Nếu có lỗi `The type or namespace 'EntityFrameworkCore' could not be found` → kiểm tra lại package đã được add đúng project chưa bằng lệnh:

```bash
dotnet list src/Folio.Infrastructure/Folio.Infrastructure.csproj package
```

---

## Kết quả sau bước này

**Package distribution:**

| Project | Packages |
|---|---|
| `Folio.Domain` | _(không có)_ |
| `Folio.Application` | _(không có)_ |
| `Folio.Infrastructure` | `Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1`, `Microsoft.EntityFrameworkCore.Design 10.0.5` |
| `Folio.Api` | `Microsoft.EntityFrameworkCore.Design 10.0.5` |

**`dotnet-ef` tool:** Đã cài global, version `10.0.5`.

---

**Tiếp theo:** [03-appdbcontext.md](03-appdbcontext.md) — Tạo `AppDbContext`, interface `IAppDbContext`, đăng ký DI trong `Folio.Api`.
