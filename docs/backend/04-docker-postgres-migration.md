# Backend — Bước 4: PostgreSQL Local + Migration Đầu Tiên

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo `docker-compose.dev.yml` để chạy PostgreSQL local, kiểm tra kết nối, tạo và apply migration đầu tiên.
> **Yêu cầu:** Docker Desktop đang chạy, đã hoàn thành Bước 1–3.

---

## Tổng quan — sẽ làm gì

```
infra/
└── docker-compose.dev.yml      ← tạo mới, chạy PostgreSQL 17 local

api/src/Folio.Infrastructure/
└── Persistance/
    └── Migrations/             ← được tạo tự động bởi dotnet ef
        ├── XXXXXX_InitialCreate.cs
        └── AppDbContextModelSnapshot.cs
```

---

## Bước 1 — Tạo `infra/docker-compose.dev.yml`

Trong **Windows Terminal**, từ thư mục gốc repo:

```bash
cd d:\Dev\Projects\Personal\folio
```

Mở **Visual Studio Code** (hoặc bất kỳ text editor nào), tạo file `infra/docker-compose.dev.yml` với nội dung:

```yaml
# Dev-only: chạy PostgreSQL local để phát triển
# Khởi động: docker compose -f infra/docker-compose.dev.yml up -d
# Dừng:      docker compose -f infra/docker-compose.dev.yml down
# Xóa data:  docker compose -f infra/docker-compose.dev.yml down -v

services:
  db:
    image: postgres:17-alpine
    container_name: folio_db_dev
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: folio
      POSTGRES_USER: sa
      POSTGRES_PASSWORD: A@a123456
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sa -d folio"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_dev_data:
```

> **`POSTGRES_DB: folio`** — match với `Database=folio` trong `.env`. PostgreSQL tự tạo database này khi container khởi động lần đầu.

> **`healthcheck`:** `pg_isready` kiểm tra PostgreSQL đã sẵn sàng nhận kết nối chưa. `start_period: 10s` cho phép container có thời gian khởi động trước khi bắt đầu tính retries — tránh false failure khi init lần đầu chậm hơn bình thường.

> **`restart: unless-stopped`:** Container tự khởi động lại sau khi máy restart, trừ khi bạn chủ động `docker compose down`.

---

## Bước 2 — Khởi động PostgreSQL

Trong **Windows Terminal**, từ thư mục gốc repo:

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

Output kỳ vọng:

```
[+] Running 2/2
 ✔ Volume "folio_postgres_dev_data"  Created
 ✔ Container folio_db_dev            Started
```

### Kiểm tra container đang chạy

Mở **Docker Desktop** → tab **Containers** — phải thấy `folio_db_dev` với trạng thái **Running** (hình tròn xanh).

Hoặc kiểm tra qua Terminal:

```bash
docker compose -f infra/docker-compose.dev.yml ps
```

Output kỳ vọng:

```
NAME            IMAGE                COMMAND                  SERVICE   CREATED         STATUS                   PORTS
folio_db_dev    postgres:17-alpine   "docker-entrypoint.s…"   db        X seconds ago   Up X seconds (healthy)   0.0.0.0:5432->5432/tcp
```

> **Chú ý status `(healthy)`** — phải chờ đến khi thấy `(healthy)` thay vì `(health: starting)` mới tiến hành bước tiếp theo. Thường mất 15–30 giây.

---

## Bước 3 — Kiểm tra kết nối bằng PgAdmin

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

## Bước 4 — Tạo Migration đầu tiên

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
> **`--startup-project`:** Chỉ định project **entry point** — nơi `dotnet ef` sẽ khởi động app để discover DbContext và đọc connection string (`Folio.Api`). Vì `Program.cs` của `Folio.Api` có `Env.Load()` và `AddInfrastructure()`, tool sẽ tìm thấy `AppDbContext` thông qua DI.

Output kỳ vọng:

```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

Sau khi chạy xong, trong **Solution Explorer** của VS 2026, mở rộng `Folio.Infrastructure` → `Persistance` → phải thấy folder **`Migrations`** với 2 files:

```
Migrations/
├── YYYYMMDDHHMMSS_InitialCreate.cs
└── AppDbContextModelSnapshot.cs
```

---

## Bước 5 — Apply Migration lên database

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

## Bước 6 — Kiểm tra app chạy được

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

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Unable to connect to database` | Container chưa healthy hoặc sai credentials | Kiểm tra `docker compose ps` xem status `(healthy)` chưa, kiểm tra credentials trong `.env` khớp với `docker-compose.dev.yml` |
| `No DbContext was found` | `dotnet ef` không tìm thấy DbContext | Đảm bảo đúng `--startup-project` là `Folio.Api`, và `AddInfrastructure` đã được gọi trong `Program.cs` |
| `Connection refused` port 5432 | Port bị chiếm hoặc container chưa chạy | Chạy `docker compose -f infra/docker-compose.dev.yml up -d` lại |
| `.env` không được load | `Env.Load()` thiếu hoặc đặt sai vị trí | Kiểm tra `Env.Load()` là dòng đầu tiên trong `Program.cs`, **trước** `WebApplication.CreateBuilder` |

---

## Kết quả sau bước này

```
infra/
└── docker-compose.dev.yml          ✓

api/src/Folio.Infrastructure/
└── Persistance/
    └── Migrations/                 ✓ (được tạo bởi dotnet ef)
        ├── XXXXXX_InitialCreate.cs
        └── AppDbContextModelSnapshot.cs
```

**Database:** PostgreSQL `folio` đang chạy local, `__EFMigrationsHistory` table đã tồn tại.

---

**Tiếp theo:** [05-health-check.md](05-health-check.md) — Thêm `GET /health` endpoint để kiểm tra trạng thái app và database connection.
