# Folio — Chi tiết 5 Sections

> **Last updated:** 2026-04-03 · **Version:** 1.1

---

## Tổng quan

```
folio/
├── Showcase   → Projects & portfolio
├── Tools      → Dev utilities
├── Lab        → Communication & learning
├── Blog       → TIL, bài viết, changelog
└── Journal    → Decision records
```

---

## Showcase

### Mô tả

Nơi trưng bày các dự án đã thực hiện. Khác GitHub profile ở chỗ: **kể câu chuyện đằng sau mỗi project** — tại sao làm, học được gì, khó khăn ở đâu — chứ không chỉ là list repo.

### Tính năng

- Mỗi project là một card với đầy đủ thông tin:
  - Tên & mô tả ngắn
  - Tech stack (dạng tag: `.NET`, `PostgreSQL`, `EF Core`, ...)
  - Link GitHub repo
  - Điểm nổi bật về kiến trúc hoặc bài toán đã giải quyết
  - Trạng thái: `In Progress` / `Completed` / `Archived`
- Bài viết chi tiết giải thích kiến trúc, design decisions (liên kết với Blog)
- Filter theo tech stack và trạng thái

### Mở rộng tương lai

Theo thời gian, "project" mở rộng định nghĩa — không giới hạn ở source code:

- Hệ thống thiết kế kiến trúc (dù AI implement)
- Workflow automation đã orchestrate
- Giải pháp end-to-end mà code chỉ là một phần giá trị

---

## Tools

### Mô tả

Khu vực chứa các dev utility chạy ngay trên browser. Mỗi tool là một standalone page, không cần login, mở ra dùng ngay. Section "sống" nhất — mỗi khi gặp nhu cầu mới trong công việc, build thêm một tool.

### Trạng thái hiện tại

| Tool | Route | Status |
|------|-------|--------|
| **JWT Decoder · Encoder** | `/tools/jwt-decoder-encoder` | ✅ Live |
| Base64 Codec | `/tools/base64` | Planned |
| JSON Formatter | `/tools/json-formatter` | Planned |
| Hash Generator | `/tools/hash` | Planned |
| URL Encoder | `/tools/url-encoder` | Planned |
| Regex Tester | `/tools/regex` | Planned |

> **Lưu ý:** JWT Decoder · Encoder vượt scope ban đầu — có đầy đủ decode (read-only), encode (editable header/payload/secret + algorithm selector HS256/384/512), verify signature, copy generated token, expiry warning. Đây là hướng đúng: mỗi tool phải là một "studio" nhỏ hoàn chỉnh, không chỉ là wrapper đơn giản.

### Tiến hoá theo thời gian

Tools sẽ dần chuyển từ utility đơn giản sang **automation workflow và AI-powered tools**:

- Tool review code architecture tự động
- Pipeline phân tích database performance
- Workflow generate API documentation từ source code
- Các tool có chiều sâu, thể hiện tư duy, không dễ bị commodity hoá

### Triết lý

> *Mỗi khi gặp một vấn đề lặp đi lặp lại trong công việc — biến nó thành một tool.*

---

## Lab

### Mô tả

Bắt đầu là nơi tự học và luyện tiếng Anh theo ngữ cảnh dev. Về lâu dài, mở rộng thành **Communication Lab** — rèn mọi kỹ năng giao tiếp chuyên nghiệp.

### Giai đoạn đầu — English Learning

- Flashcard từ vựng IT (technical terms, phrases dùng trong code review, standup, email)
- Bài tập dịch Anh–Việt các đoạn documentation hoặc technical article
- Nhật ký viết tiếng Anh — mỗi ngày vài câu mô tả việc đã làm
- AI grammar check (Anthropic API) — gợi ý cách diễn đạt tốt hơn

### Mở rộng tương lai

- Technical writing (RFC, design doc, PR description)
- Presentation skills
- Cross-cultural communication
- Negotiation trong môi trường công việc

### Tại sao không chỉ dừng ở "học tiếng Anh"?

Real-time translation đang tiến bộ rất nhanh. 10 năm nữa, rào cản ngôn ngữ sẽ gần như biến mất về mặt công cụ. Nhưng thứ AI không thay thế được là **khả năng giao tiếp, thuyết phục, và xây dựng quan hệ** — viết RFC thuyết phục team, present ý tưởng trước stakeholder, thương lượng trong cuộc họp.

---

## Blog

### Mô tả

Gộp TIL, bài viết dài, và changelog vào chung một section với ba mode:

| Mode | Mô tả | Độ dài | Tần suất |
|------|-------|--------|---------|
| **TIL** | Entry ngắn, ghi nhanh điều học được | Vài dòng | Hàng ngày |
| **Post** | Bài viết có cấu trúc, đầu tư hơn | Vài trăm từ+ | Hàng tuần/tháng |
| **Changelog** | Ghi lại thay đổi trên Folio | Vài dòng | Mỗi lần ship |

### Tính năng

- Markdown editor
- Lưu bài viết dạng Markdown trong database, render ra HTML
- Phân loại bằng tag/category
- Full-text search
- SEO cơ bản: meta tags, sitemap, Open Graph
- RSS feed

### Tại sao Changelog nằm ở đây?

Changelog bản chất cũng là một dạng ghi chép theo thời gian. Nó nhẹ hơn blog nhưng vẫn là content có giá trị, thể hiện sự chuyên nghiệp và cam kết maintain sản phẩm.

### Giá trị dài hạn

20 năm nữa AI có thể viết code thay, nhưng **tư duy và góc nhìn cá nhân thì không**. Khi AI-generated content tràn ngập, nội dung "thật" từ con người thật trở nên hiếm và có giá trị hơn.

---

## Journal

### Mô tả

Nơi ghi lại từng quyết định kỹ thuật quan trọng. Trong thời đại AI, giá trị lớn nhất của một dev là **khả năng ra quyết định** — chọn kiến trúc nào, trade-off nào chấp nhận được, khi nào build vs buy, dùng pattern gì cho bài toán gì.

### Cấu trúc mỗi entry

- **Context** — tình huống lúc đó thế nào
- **Options** — có những phương án gì
- **Decision** — chọn phương án nào và tại sao
- **Outcome** — thực tế ra sao
- **Retrospective** — nếu làm lại thì có quyết định khác không

### Mối liên hệ với Blog

Blog và Journal cùng ghi lại quá trình trưởng thành — nhưng ở hai độ sâu khác nhau. TIL trong Blog là quan sát hàng ngày; Journal là kết tinh từ những quyết định có trọng lượng. Theo thời gian, các bài Blog thường dần định hình nên các entry Journal.

### Giá trị dài hạn

20 năm nữa, recruiter sẽ không hỏi *"bạn code được ngôn ngữ gì"* mà sẽ hỏi *"bạn đã ra những quyết định kỹ thuật nào và kết quả thế nào"*. Journal chính là câu trả lời sống cho câu hỏi đó.
