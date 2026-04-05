# Backend — Bước 4: PostgreSQL Local + Migration Đầu Tiên

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Chạy PostgreSQL local bằng `infra/docker-compose.yml`, kiểm tra kết nối, tạo và apply migration đầu tiên.
> **Yêu cầu:** Docker Desktop đang chạy, đã hoàn thành Bước 1–3.

---

## Tổng quan — sẽ làm gì

```
api/src/Folio.Infrastructure/
└── Persistence/
    └── Migrations/             ← được tạo tự động bởi dotnet ef
        ├── XXXXXX_InitialCreate.cs
        └── AppDbContextModelSnapshot.cs
```

File `infra/docker-compose.yml` đã tồn tại trong repo — không cần tạo thêm file nào.

---

## Bước 1 — Khởi động PostgreSQL

Trong **Windows Terminal**, từ thư mục gốc repo:

```bash
cd d:\Dev\Projects\Personal\folio
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db
```

> **`--env-file .env.dev`:** Truyền file `.env.dev` vào Docker Compose để điền các biến `${PROJECT_NAME}`, `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, v.v.
>
> **`db`:** Chỉ khởi động service `db` (PostgreSQL) — không khởi động service `web` lúc này.

Output kỳ vọng:

```
[+] Running 2/2
 ✔ Volume "folio_postgres_dev_data"  Created
 ✔ Container folio-db-1              Started
```

### Kiểm tra container đang chạy

Mở **Docker Desktop** → tab **Containers** — phải thấy `folio-db-1` với trạng thái **Running** (hình tròn xanh).

Hoặc kiểm tra qua Terminal:

```bash
docker compose -f infra/docker-compose.yml --env-file .env.dev ps
```

Output kỳ vọng:

```
NAME          IMAGE                   COMMAND                  SERVICE   CREATED         STATUS                   PORTS
folio-db-1    folio-postgres:dev      "docker-entrypoint.s…"   db        X seconds ago   Up X seconds (healthy)   0.0.0.0:5432->5432/tcp
```

> **Chú ý status `(healthy)`** — phải chờ đến khi thấy `(healthy)` thay vì `(health: starting)` mới tiến hành bước tiếp theo. Thường mất 15–30 giây.

---

## Bước 2 — Kiểm tra kết nối bằng PgAdmin

Mở **PgAdmin** → trong panel bên trái (Browser), click chuột phải vào **Servers** → chọn **Register** → **Server...**.

Trong dialog **Register - Server**:

**Tab General:**
- **Name:** `folio-dev` (tên hiển thị tùy ý)

**Tab Connection:**
- **Host name/address:** `localhost`
- **Port:** `5432`
- **Maintenance database:** `folio`
- **Username:** `sa`
- **Password:** `A@a123456`
- Tick **Save password**

Click **Save**.

Trong Browser panel, mở rộng **Servers** → **folio-dev** → **Databases** — phải thấy database **`folio`** đã tồn tại.

---

## Bước 3 — Tạo Migration đầu tiên

Migration đầu tiên (`InitialCreate`) chụp lại trạng thái model hiện tại của `AppDbContext` và tạo script SQL để build schema database.

> **Lưu ý:** Hiện tại `AppDbContext` chưa có entity nào — migration `InitialCreate` sẽ tạo ra một migration **rỗng**. Đây là chủ đích — đặt nền móng đúng trước, entity sẽ thêm vào bước sau.

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
cd d:\Dev\Projects\Personal\folio\api
```

Chạy lệnh migration:

```bash
dotnet ef migrations add InitialCreate \
  --project src/Folio.Infrastructure/Folio.Infrastructure.csproj \
  --startup-project src/Folio.Api/Folio.Api.csproj
```

> **`--project`:** Chỉ định project **chứa `AppDbContext`** — nơi migration files sẽ được tạo (`Folio.Infrastructure`).
>
> **`--startup-project`:** Chỉ định project **entry point** — nơi `dotnet ef` sẽ khởi động app để discover DbContext và đọc connection string (`Folio.Api`). Vì `Program.cs` của `Folio.Api` có `Env.TraversePath().Load()` và `AddInfrastructure()`, tool sẽ tìm thấy `AppDbContext` thông qua DI.

Output kỳ vọng:

```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

Sau khi chạy xong, trong **Solution Explorer** của VS 2026, mở rộng `Folio.Infrastructure` → `Persistence` → phải thấy folder **`Migrations`** với 2 files:

```
Migrations/
├── YYYYMMDDHHMMSS_InitialCreate.cs
└── AppDbContextModelSnapshot.cs
```

---

## Bước 4 — Apply Migration lên database

```bash
dotnet ef database update \
  --project src/Folio.Infrastructure/Folio.Infrastructure.csproj \
  --startup-project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng:

```
Build started...
Build succeeded.
Applying migration 'YYYYMMDDHHMMSS_InitialCreate'.
Done.
```

### Xác nhận trong PgAdmin

Trong **PgAdmin** → mở rộng **folio-dev** → **Databases** → **folio** → **Schemas** → **public** → **Tables**.

Click chuột phải vào **Tables** → **Refresh** — phải thấy table **`__EFMigrationsHistory`**. Table này do EF Core tự tạo để theo dõi các migration đã được apply.

---

## Bước 5 — Kiểm tra app chạy được

Trong **Windows Terminal**, từ thư mục `api/`:

```bash
dotnet run --project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng (không có lỗi connection):

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

Mở browser, truy cập `http://localhost:5000/scalar/v1` — phải thấy Scalar UI hiện ra.

Dừng app: `Ctrl + C`.

---

## Lệnh Docker Compose thường dùng

Tất cả chạy từ **thư mục gốc repo** với flag `--env-file .env.dev`:

```bash
# Khởi động (build image nếu chưa có)
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db --build

# Khởi động (không build lại)
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db

# Dừng
docker compose -f infra/docker-compose.yml --env-file .env.dev down

# Dừng và xóa volume data
docker compose -f infra/docker-compose.yml --env-file .env.dev down -v
```

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Unable to connect to database` | Container chưa healthy hoặc sai credentials | Kiểm tra `docker compose ps` xem status `(healthy)` chưa, kiểm tra credentials trong `.env.dev` khớp với `docker-compose.yml` |
| `No DbContext was found` | `dotnet ef` không tìm thấy DbContext | Đảm bảo đúng `--startup-project` là `Folio.Api`, và `AddInfrastructure` đã được gọi trong `Program.cs` |
| `Connection refused` port 5432 | Port bị chiếm hoặc container chưa chạy | Chạy `docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db` lại |
| `.env.dev` không được load | `Env.TraversePath().Load()` thiếu hoặc đặt sai vị trí | Kiểm tra `Env.TraversePath().Load()` là dòng đầu tiên trong `Program.cs`, **trước** `WebApplication.CreateBuilder` |

---

## Kết quả sau bước này

```
api/src/Folio.Infrastructure/
└── Persistence/
    └── Migrations/                 ✓ (được tạo bởi dotnet ef)
        ├── XXXXXX_InitialCreate.cs
        └── AppDbContextModelSnapshot.cs
```

**Database:** PostgreSQL `folio` đang chạy local, `__EFMigrationsHistory` table đã tồn tại.

---

**Tiếp theo:** [05-health-check.md](05-health-check.md) — Thêm `GET /health` endpoint để kiểm tra trạng thái app và database connection.
