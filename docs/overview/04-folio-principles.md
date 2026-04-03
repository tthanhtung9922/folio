# Folio — Nguyên tắc phát triển

> **Last updated:** 2026-04-03 · **Version:** 1.0

---

## Nguyên tắc cốt lõi

### 1. Deploy sớm, iterate nhanh

> *Deploy ngay cả khi chỉ có trang trắng với tên mình.*

Không chờ "hoàn thiện" mới lên production. Mỗi đợt phát triển đều có sản phẩm dùng được ngay. Feedback loop ngắn nhất có thể.

### 2. Dùng thật mỗi ngày

> *Tool tốt nhất là tool mình thực sự dùng mỗi ngày.*

Tiêu chí quan trọng nhất khi quyết định build feature: **mình có dùng nó hàng ngày không?** Nếu không — chưa cần làm. Folio hay nhất khi chính chủ dùng nó mỗi ngày.

### 3. Đừng cầu toàn từ đầu

> *Chọn 2–3 thứ giải quyết đúng vấn đề đang gặp, build xong rồi mở rộng dần.*

Sự hoàn hảo là kẻ thù của tiến bộ.

### 4. Content "hai trong một"

> *Viết về chính quá trình xây dựng Folio — đó là content tự nhiên nhất.*

Mỗi đợt build xong là có bài viết cho Blog. Quá trình xây dựng platform chính là nội dung tốt nhất.

### 5. Mỗi section tiến hoá độc lập

Không ép buộc tất cả section phải hoàn thiện cùng lúc. Tools có thể thêm mới mỗi tuần, trong khi Journal chỉ thêm entry mỗi tháng — và đó là bình thường.

### 6. Nhất quán trong thiết kế

Mọi thứ trong Folio kể cùng một câu chuyện — từ visual design đến tone of voice. Sự nhất quán tạo ra identity.

---

## Quy ước kỹ thuật

### Source control

- **GitHub public monorepo** — `folio/` với hai workspace `api/` và `web/`
- **CI/CD từ ngày đầu** — GitHub Actions chạy từ commit đầu tiên, hai workflow riêng biệt
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Scope commit theo workspace: `feat(api):`, `feat(web):`
- Branch strategy: `main` (production) + feature branches ngắn

### Backend — `api/` (.NET 10 LTS)

- Follow .NET conventions và C# coding standards
- **CSharpier** cho auto-formatting — opinionated, không cần cấu hình
- Clean code > clever code
- Đặt tên rõ ràng, tự giải thích (self-documenting)
- Comment chỉ khi logic không tự giải thích được
- `record` types cho DTOs, immutable value objects
- Result pattern cho error handling — không throw exceptions cho business errors
- DDD + Clean Architecture: Domain → Application → Infrastructure → Presentation
- CQRS với MediatR 14.x: Commands tách biệt Queries

### Frontend — `web/` (Next.js 16 + TypeScript 5.x)

- **Biome** cho linting + formatting — nhanh hơn ESLint + Prettier ~10x
- Strict TypeScript — không dùng `any`
- React Server Components mặc định — `"use client"` chỉ khi thật sự cần
- React Compiler stable — không cần `useMemo`/`useCallback` thủ công
- Co-locate styles, types, tests gần component

### Testing

- Unit tests (xUnit + FluentAssertions) cho business logic và validators
- Integration tests (WebApplicationFactory + Testcontainers) cho API endpoints
- E2E tests (Playwright) cho critical user flows
- Frontend unit tests (Vitest + Testing Library) cho components
- Không cần 100% coverage — test những gì quan trọng và dễ break

---

## Quy ước nội dung

### Ngôn ngữ

- Tiếng Việt là ngôn ngữ chính cho nội dung cá nhân
- Thuật ngữ kỹ thuật giữ tiếng Anh — không ép dịch
- Code, API, technical docs viết tiếng Anh
- Blog có thể mix tuỳ ngữ cảnh

### TIL

- Ngắn gọn, vài dòng là đủ
- Ghi ngay khi học được, không để qua ngày
- Không cần trau chuốt — raw thoughts có giá trị riêng

### Blog Posts

- Có cấu trúc rõ ràng
- Kèm code examples khi phù hợp
- Ưu tiên practical > theoretical

### Changelog

- Mỗi lần ship feature, ghi vài dòng
- Format: `YYYY-MM-DD — [Added/Changed/Fixed] mô tả ngắn`
- Follow [Keep a Changelog](https://keepachangelog.com/) format

### Decision Records (Journal)

- Luôn ghi bối cảnh đầy đủ — context decay rất nhanh
- Ghi cả những lựa chọn đã bỏ qua và lý do
- Quay lại cập nhật "Retrospective" sau khi có kết quả thực tế
