# Folio — Định hướng tương lai & Góc nhìn AI

> **Last updated:** 2026-04-03 · **Version:** 1.0

---

## Câu hỏi cốt lõi

> *5 sections của Folio có đủ dùng trong 20 năm tới không?*

Câu trả lời: **Có, nếu chúng tiến hoá đúng cách.** Tài liệu này phân tích AI thay đổi điều gì, và Folio cần thích nghi ra sao.

---

## AI thay đổi căn bản điều gì?

| Giảm giá trị | Tăng giá trị |
|-------------|-------------|
| Viết code | Tư duy thiết kế hệ thống |
| Tra cứu syntax | Ra quyết định kỹ thuật |
| Debug lỗi đơn giản | Đặt đúng câu hỏi |
| Format / convert data | Orchestrate systems |
| Dịch thuật ngôn ngữ | Giao tiếp & thuyết phục |

Folio cần **đầu tư vào cột bên phải** — những thứ AI không thay thế được.

---

## Phân tích từng Section

### Blog — Evergreen, không cần thay đổi

**Trạng thái:** Giữ nguyên 20 năm.

AI có thể viết code thay, nhưng tư duy và góc nhìn cá nhân thì không. Viết vẫn là cách tốt nhất để hệ thống hoá suy nghĩ. Khi AI-generated content tràn ngập internet, nội dung "thật" từ con người thật trở nên **hiếm hơn và có giá trị hơn**. Blog sẽ luôn có giá trị — thậm chí giá trị càng tăng theo thời gian.

### Journal — Càng quan trọng theo thời gian

**Trạng thái:** Giá trị tăng exponentially.

Khi AI handle phần lớn implementation, khả năng ra quyết định trở thành **skill quan trọng nhất**. Journal ghi lại lịch sử decision-making — thứ không AI nào tạo ra thay được.

20 năm nữa, recruiter sẽ hỏi *"bạn đã ra những quyết định kỹ thuật nào?"* chứ không phải *"bạn code được ngôn ngữ gì?"*

### Showcase — Giữ, nhưng mở rộng định nghĩa

**Trạng thái:** Cần tiến hoá.

Hiện tại Showcase là nơi trưng bày source code backend. Nhưng 10 năm nữa, "project" của một dev có thể không còn là repo code thuần tuý:

- Hệ thống thiết kế kiến trúc (AI implement)
- Workflow automation đã orchestrate
- Giải pháp end-to-end mà code chỉ là 20% giá trị

**Hướng tiến hoá:** Showcase nên hiểu rộng hơn — nơi trưng bày **những gì đã tạo ra**, không giới hạn ở code.

### Tools — Cần chuyển hoá mạnh nhất

**Trạng thái:** Utility tools sẽ lỗi thời trong 5–10 năm.

JWT Decoder, JSON Formatter, Text Diff... AI assistant sẽ làm những việc này instantly chỉ bằng một câu nói. Ngay bây giờ đã có thể paste JWT token vào Claude và nhận kết quả decode ngay.

**Hướng tiến hoá:** Từ utility tools → automation workflow & AI-powered tools:

- Tool review code architecture tự động
- Pipeline phân tích database performance
- Workflow generate API documentation từ source code
- Các tool có **chiều sâu**, thể hiện tư duy, không dễ bị commodity hoá

> **Lưu ý thực tế:** Ngắn hạn vẫn nên bắt đầu với JWT Decoder, Text Diff — vì cần chúng ngay bây giờ, và quá trình build giúp xây nền tảng kỹ thuật. Chỉ là đừng dừng lại ở đó.

### Lab — Cần mở rộng bản chất

**Trạng thái:** "Học tiếng Anh" sẽ thay đổi, nhưng communication skills thì vĩnh viễn.

Real-time translation đang tiến bộ rất nhanh. 10 năm nữa, rào cản ngôn ngữ sẽ gần như biến mất về mặt công cụ. Nhưng thứ AI không thay thế được:

- Viết RFC thuyết phục team
- Present ý tưởng trước stakeholder
- Thương lượng trong cuộc họp
- Cross-cultural communication

**Hướng tiến hoá:** Từ English Learning → Communication Lab toàn diện.

---

## Tech Stack cũng phải tiến hoá

### TypeScript → Go-based compiler (TS 7.0)

TypeScript 6.0 (hiện tại) là phiên bản cuối cùng trên nền JS compiler. Microsoft đang viết lại compiler bằng Go — nhanh hơn ~10x, shared-memory multithreading. Khi TS 7.0 stable, Folio sẽ migrate. TS 6.0 đã có migration flags để chuẩn bị.

### AI-native development workflow

Hiện tại dùng AI như tool hỗ trợ (Claude Code, Copilot). Tương lai gần, AI sẽ tham gia sâu hơn: review PRs tự động, generate test cases, suggest architectural improvements. Folio nên thiết kế API và data model sao cho AI agents dễ tương tác.

### Infrastructure as Code

Khi complexity tăng, chuyển từ manual deployment sang IaC (Pulumi/Terraform). Render đã hỗ trợ `render.yaml` — bước đầu tốt.

---

## Tính năng tiềm năng xa hơn

### AI Chat Integration

Khi Folio đã có đủ content (blog, showcase, journal), tích hợp chatbot qua Anthropic API:

- RAG đơn giản: embed content vào vector store (pgvector trên Neon)
- AI trả lời dựa trên content thật
- Model: `claude-haiku` cho conversation thường, `claude-sonnet` cho câu phức tạp
- **Thời điểm:** Sau khi có ≥20 bài Blog + ≥5 Journal entries

### Open API / Public Endpoints

Expose một vài API miễn phí cho cộng đồng dùng (format SQL, validate JSON...). Thu hút traffic và xây dựng uy tín. **Thời điểm:** Khi Tools đã đủ chất lượng và ổn định.

### Status Dashboard

Monitor uptime của chính Folio, hiển thị health check và response time. Vừa hữu ích vừa thể hiện kỹ năng DevOps. **Thời điểm:** Khi platform đã có traffic thực sự cần monitor.

---

## Tóm lại

Folio được thiết kế để **tăng giá trị theo thời gian**, không bị AI làm cho lỗi thời. Chìa khoá là:

1. **Đầu tư vào thứ AI không thay thế** — tư duy, quyết định, góc nhìn cá nhân
2. **Để các section tiến hoá** — không cứng nhắc giữ nguyên định nghĩa ban đầu
3. **Content thật từ người thật** — giá trị càng tăng khi AI content tràn ngập
4. **Tech stack cũng phải tiến hoá** — theo dõi TS 7.0, AI workflow, infrastructure trends
