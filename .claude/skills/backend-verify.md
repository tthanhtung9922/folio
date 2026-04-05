---
name: backend-verify
description: Verify that backend source code and documentation are fully in sync — checks namespaces, constructor styles, package versions, folder names, code snippets, and cross-doc links. Auto-fixes all discrepancies found, runs dotnet build to confirm 0 errors, then commits and pushes. Trigger this skill when the user says "verify", "kiểm tra", "kiểm tra đồng bộ", "verify backend", "check sync", "xác nhận", "đồng bộ code và doc", or any variation of wanting to confirm backend code matches docs before committing.
---

Bạn đang thực hiện verify toàn bộ backend — đảm bảo source code trong `api/` và documentation trong `docs/backend/` khớp hoàn toàn với nhau.

## Bước 1 — Thu thập toàn bộ context

Đọc song song tất cả các nguồn sau:

**Source code (`api/src/`):**
- Tất cả file `.csproj` — lấy package names, versions, project references
- Tất cả file `.cs` — lấy namespace, class name, constructor style, method signatures
- Cấu trúc thư mục thực tế (folder names, file names)

**Docs (`docs/backend/`):**
- Tất cả file `.md` — đọc toàn bộ, chú ý các code block, đường dẫn, link "Tiếp theo"

**Infra và env:**
- Các file trong `infra/` (docker-compose files)
- `.env.example` ở repo root
- `api/.gitignore`, `.gitignore` root

## Bước 2 — Cross-check từng hạng mục

Kiểm tra tuần tự và ghi lại **tất cả** discrepancies tìm thấy:

### 2A. Namespace & folder names
- Tên folder thực tế vs tên xuất hiện trong docs và trong `namespace` khai báo
- Ví dụ điển hình: `Persistance` (typo) vs `Persistence` (đúng)

### 2B. Package versions
- Version trong từng `.csproj` vs version được ghi trong docs
- Kiểm tra cả `DotNetEnv`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.*`

### 2C. Code snippets trong docs
So sánh từng code block trong docs với file thực tế:
- **Constructor style:** primary constructor `MyClass(Params p) : Base(p)` vs traditional `public MyClass(Params p) { ... }`
- **`async/await` thừa:** `return await base.Method()` vs `return base.Method()`
- **`using` statements:** có thừa hay thiếu so với code thực
- **Namespace declarations** trong snippet có khớp với file thực không
- **Method signatures** có khớp không

### 2D. File paths & links
- Link "Tiếp theo" ở cuối mỗi doc — file đích có tồn tại không
- Đường dẫn folder được nhắc trong docs (ví dụ `api/src/Folio.Infrastructure/Persistence/`) có đúng với cấu trúc thực không

### 2E. Thông tin cross-doc
- Package được thêm ở bước sau có được cập nhật vào bảng tổng hợp ở bước trước không
- Ví dụ: `DotNetEnv` thêm ở bước 3 nhưng bảng package distribution ở bước 2 chưa có

### 2F. Docker Compose & env
- Biến `${VAR}` trong `docker-compose.dev.yml` có tương ứng với key trong `.env.example` không
- Credentials mẫu trong docs có khớp với `.env.example` không

## Bước 3 — Báo cáo

Liệt kê toàn bộ discrepancies theo format:

```
### Discrepancies tìm thấy

| # | File | Vấn đề | Code/Doc hiện tại | Đúng phải là |
|---|------|--------|-------------------|--------------|
| 1 | docs/backend/03-... | Namespace sai | `Persistance` | `Persistence` |
| 2 | docs/backend/02-... | Thiếu DotNetEnv | bảng không có | thêm vào |
```

Nếu không có discrepancy nào: báo "✓ Tất cả đồng bộ — không có discrepancy."

## Bước 4 — Fix tất cả

Fix theo thứ tự ưu tiên:
1. **Typo trong source code** (sai chính tả folder, namespace) — đổi tên folder/file thực tế, update namespace trong code
2. **Code snippets trong docs** — cập nhật theo code thực tế
3. **Thông tin cross-doc** — sync thông tin giữa các doc
4. **Đường dẫn và links** — sửa cho đúng

Với mỗi fix: dùng Edit tool, không rewrite toàn bộ file trừ khi thực sự cần.

## Bước 5 — Build check

```bash
cd api && dotnet build Folio.slnx
```

Output phải là `Build succeeded. 0 Warning(s) 0 Error(s)`.

Nếu có lỗi: đọc error message, fix nguyên nhân, build lại. Không bỏ qua warning liên quan đến namespace hay missing reference.

## Bước 6 — Commit & push

```bash
git add <các file đã sửa>
git commit -m "fix: sync backend source code and documentation"
git push origin dev
```

Nếu không có gì thay đổi (đã đồng bộ hoàn toàn): báo cho user biết, không tạo empty commit.

## Lưu ý quan trọng

- **Docs follow code, không phải ngược lại** — trừ khi vấn đề là typo trong code (sai chính tả tên folder, tên class). Typo trong code thì fix code và cập nhật docs theo.
- **Đọc code thực tế trước** — không assume code trông như thế nào dựa vào docs.
- **Kiểm tra kỹ primary constructor** — C# 12 primary constructor `Class(Params p) : Base(p)` trông rất khác constructor truyền thống, dễ bị bỏ sót.
