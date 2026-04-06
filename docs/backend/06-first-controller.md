# Backend — Bước 6: Controller Đầu Tiên

> **Đợt:** 2A — Backend foundation
> **Mục tiêu:** Tạo `PingController` — controller đầu tiên theo chuẩn Clean Architecture, test với Scalar UI.
> **Yêu cầu:** Đã hoàn thành Bước 1–5.

---

## Tổng quan — sẽ tạo gì

```
api/src/Folio.Api/
└── Controllers/
    └── PingController.cs     ← GET /api/ping → { status, timestamp }
```

Endpoint `GET /api/ping` trả về JSON đơn giản — xác nhận API đang chạy và response đúng format.

---

## Bước 1 — Tạo file `PingController.cs`

Trong **Visual Studio 2026**, mở **Solution Explorer** (`Ctrl + Alt + L`).

Mở rộng project `Folio.Api` → click chuột phải vào folder **`Controllers`** → chọn **Add** → **New Item...**.

> **Không thấy folder `Controllers` trong Solution Explorer?** Folder tồn tại trên disk nhưng VS ẩn vì trống. Cách nhanh nhất: tạo file `PingController.cs` thẳng trong **VS Code** (hoặc File Explorer) tại đường dẫn `api/src/Folio.Api/Controllers/PingController.cs` — VS sẽ tự detect và hiển thị khi file có nội dung. **Không** dùng Add → New Folder vì sẽ báo lỗi "conflicts with existing folder".

Trong hộp thoại **Add New Item**:
1. Trong ô tìm kiếm (góc trên phải), gõ `API Controller`
2. Chọn **API Controller - Empty**
3. Đặt tên `PingController.cs`
4. Click **Add**

Visual Studio sẽ tạo file với nội dung mẫu. **Xóa toàn bộ nội dung mặc định**, nhập:

```csharp
using Microsoft.AspNetCore.Mvc;

namespace Folio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
    }
}
```

Lưu file: `Ctrl + S`.

> **`[ApiController]`:** Bật các tính năng mặc định — tự động validate model, tự suy ra nguồn binding (body/query/route), trả về `400 Bad Request` có cấu trúc khi validation fail.
>
> **`[Route("api/[controller]")]`:** Token `[controller]` tự động thay bằng tên class bỏ đi hậu tố `Controller`. `PingController` → route base là `api/ping`.
>
> **`ControllerBase`** (không phải `Controller`): Dùng cho API — không có view, gọn hơn.
>
> **`Ok(new { ... })`:** Trả về HTTP 200 với body JSON. Anonymous object `{ status, timestamp }` tự động serialize bởi System.Text.Json.

---

## Bước 2 — Kiểm tra build

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

---

## Bước 3 — Chạy app và test với Scalar UI

### Khởi động PostgreSQL (nếu chưa chạy)

Từ thư mục gốc repo:

```bash
docker compose -f infra/docker-compose.yml --env-file .env.dev up -d db
```

### Chạy app

Từ thư mục `api/`:

```bash
dotnet run --project src/Folio.Api/Folio.Api.csproj
```

Output kỳ vọng (không có error):

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Test với Scalar UI

Mở browser, truy cập `http://localhost:5000/scalar/v1`.

Trong Scalar UI:
1. Tìm endpoint **`GET /api/ping`** trong danh sách bên trái
2. Click vào endpoint đó
3. Click nút **Send** (hoặc **Try it**)

Response kỳ vọng (HTTP 200):

```json
{
  "status": "ok",
  "timestamp": "2026-04-05T10:30:00.000Z"
}
```

### Test bằng curl

```bash
curl http://localhost:5000/api/ping
```

Output kỳ vọng:

```json
{"status":"ok","timestamp":"2026-04-05T10:30:00.0000000Z"}
```

Dừng app: `Ctrl + C`.

---

## Giải thích routing

| Thành phần | Giá trị | Kết quả |
|---|---|---|
| `[Route("api/[controller]")]` | `[controller]` = `Ping` | Route base: `api/ping` |
| `[HttpGet]` trên method | Không có tham số | Full route: `GET /api/ping` |
| `[HttpGet("{id}")]` | Có tham số | Full route: `GET /api/ping/{id}` |

Convention đặt tên: mọi controller đều dùng prefix `api/` để phân biệt với static files hay trang web.

---

## Kết quả sau bước này

```
api/src/Folio.Api/
└── Controllers/
    └── PingController.cs     ✓
```

**Endpoint hoạt động:**
- `GET /api/ping` → `200 OK` với `{ status, timestamp }`
- `GET /health` → `Healthy` (từ bước 5)

---

**Tiếp theo:** [07-domain-entity.md](07-domain-entity.md) — Tạo entity đầu tiên trong `Folio.Domain`, cấu hình với EF Core, tạo migration mới.
