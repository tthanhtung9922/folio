# Design System: Folio

**Project:** folio — personal developer platform
**Style:** Terracotta Mono
**Last updated:** April 2026

---

## 1. Visual Theme & Atmosphere

Folio mang aesthetic **Terracotta Mono** — ấm, thủ công, chính xác. Cảm giác như một type foundry hoặc tạp chí kỹ thuật in trên giấy tốt, chứ không phải một SaaS dashboard generic.

**Mood:** Quiet authority. Không sterile minimalism, không maximalist noise — typography làm chủ, color xuất hiện có mục đích.

**Density:** Medium. Whitespace rộng trong component, grid cứng và structural — lấy cảm hứng từ layout báo in.

---

## 2. Color Palette & Roles

| Name                 | Hex       | Role                                                                                         |
| -------------------- | --------- | -------------------------------------------------------------------------------------------- |
| **Parchment**        | `#FBF8F4` | Primary background — tất cả screens                                                          |
| **Warm Canvas**      | `#F5EDE0` | Secondary surfaces, hero aside, pullquote band                                               |
| **Ink**              | `#2C2420` | Primary text, heading, nav, border chính, CTA button bg                                      |
| **Faded Ink**        | `#6B5A4E` | Body text phụ, mô tả                                                                         |
| **Ghost Ink**        | `#B8A898` | Metadata, timestamp, muted label                                                             |
| **Terracotta**       | `#C4622D` | **Accent duy nhất** — active state, tag, progress bar, overline, blockquote border, logo dot |
| **Terracotta Pale**  | `#F2E0D4` | Accent surface — thumbnail bg, badge bg, avatar bg                                           |
| **Parchment Border** | `#E4D8CC` | Default border giữa các element                                                              |

**Nguyên tắc:** Terracotta (`#C4622D`) là màu duy nhất. Palette gần như monochrome — contrast đến từ font weight và khoảng trống, không phải màu sắc.

---

## 3. Typography Rules

### Display Font — Playfair Display

- **Dùng cho:** Article title, hero heading, pullquote, collection title, số thứ tự, stat number
- **Weights:** 400 regular, 400 italic cho emphasis
- **Sizing:** 56px (hero) → 44px (section title) → 38px (article) → 28px (stat) → 22px (pullquote) → 17px (post list) → 15px (card)
- **Letter-spacing:** `-0.02em` đến `-0.025em` (tight)

### UI Font — Montserrat

- **Dùng cho:** Nav, label, metadata, overline, footer, CTA button, identifier
- **Weights:** 300 light (default), 400 medium (active), 500 (strong label)
- **Key rule:** Tất cả nav item, label, metadata đều **lowercase** — tạo register điềm tĩnh, khác biệt với typical all-caps tech UI
- **Overline convention:** Prefix `//` — e.g. `// showcase · 12 projects`

### Không dùng

- Inter, Roboto, Arial, hoặc bất kỳ neutral grotesque nào

---

## 4. Component Stylings

### Navigation

- Sticky, `border-bottom: 2px solid #2C2420`
- Logo: `folio_` với trailing underscore + terracotta pulsing dot (animation 3s ease-in-out)
- Links: lowercase, `letter-spacing: 0.08em`, muted → terracotta on active
- CTA button: black bg, white text, `border-radius: 2px`, hover → terracotta
- Height: 56px

### Buttons

- **Primary:** `bg: #2C2420`, `color: #FBF8F4`, `padding: 11px 22px`, `border-radius: 2px`, hover → `bg: #C4622D`
- **Ghost:** underline only, no background, no border-radius
- **Không dùng** pill-shaped buttons — tối đa `border-radius: 4px`

### Post / Content Items

- Không có card box. Phân cách bằng `0.5px solid #E4D8CC` dividing lines
- Post list: 2-column grid (text + thumbnail). Thumbnail: `border-radius: 3px`, bg `#F2E0D4`
- Hover: title color → terracotta, không thay đổi background

### Borders

- **Structural:** `2px solid #2C2420` — major section breaks (hero, stats strip, content grid)
- **Content:** `0.5px solid #E4D8CC` — within sections, between list items
- **Không dùng** box-shadow hay card elevation. Depth đến từ structural borders

### Progress / Reading Indicator

- `height: 1.5px`, `background: #C4622D`
- Animate on page entry với `requestAnimationFrame`

### Blockquotes

- `border-left: 3px solid #C4622D`, `padding-left: 24px`, `border-radius: 0`
- Font: Playfair Display italic, 20px

### Tags / Badges

- Lowercase, `letter-spacing: 0.1em`, terracotta color
- Badge: terracotta pale bg + parchment border, `border-radius: 2px`

---

## 5. Layout Principles

### Grid

- Max container width: **1080px**, `padding: 0 32px`
- Hero: **2-column split** với `2px solid #2C2420` vertical divider — defining structural gesture
- Content area: **2fr / 1fr** (main + sidebar)
- Major sections: `border-bottom: 1.5px solid #2C2420`

### Spacing scale

- Section: `48–56px` (hero), `32px` (cards), `28px` (content)
- Component internal: `20–24px` (post items), `16px` (side items), `12px` (meta gaps)
- Base unit: `8px`

### Whitespace

- Negative space là structural, không phải decorative
- Body text: left-aligned — không center-align
- Article reader: `max-width: 600px`, centered — element duy nhất được center

### Overlines

- Mỗi section có overline `//` prefix
- 10px, `letter-spacing: 0.14–0.16em`, terracotta, lowercase
- Nhiều overline đi kèm horizontal rule (`width: 20px, height: 1px, bg: accent`)

### Responsive

- Mobile breakpoint: 768px
- Hero: 2-column → single column
- Nav links: hidden trên mobile
- Stats: 4-column → 2-column
- Heading scale giảm ~20% trên mobile

---

## 6. Motion & Interaction

### Page load

- `fadeUp`: `opacity 0→1`, `translateY 16px→0`, `duration: 0.6s`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Stagger delay: `0.07s` increments
- IntersectionObserver để trigger khi element vào viewport

### Custom cursor

- 10px terracotta circle, `mix-blend-mode: multiply`
- Hover interactive elements: grows to 28px, opacity 0.25
- Transition: `0.15s ease`

### Hover states

- Text/titles: `color → #C4622D`
- Buttons: `background → #C4622D`
- Nav links: `color → #C4622D`
- All transitions: `0.15s ease` — không dùng `transform: scale`

---

## 7. Voice & Tone (UI Copy)

- UI labels: lowercase — `showcase`, `tools`, `lab`, `blog`, `journal`
- Overlines: `//` prefix — `// tools · 6 utilities`
- Không dùng exclamation marks, không marketing speak
- CTA là direct verbs: `open tool →`, `read more →`, `see all →`
- Metadata format: `author · X min · [state]`
