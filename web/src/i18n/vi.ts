export const vi = {
  // ── Home page ──
  "hero.heading1": "Không chỉ là code.",
  "hero.heading2": "Đây là nền tảng cá nhân.",
  "hero.description":
    "Một hệ sinh thái sống nơi mọi khía cạnh của hành trình phát triển sự nghiệp đều có chỗ đứng. Không template, không platform có sẵn.",

  // ── Tools page ──
  "tools.description":
    "Công cụ dev nhỏ, chạy hoàn toàn trên trình duyệt. Không cần đăng nhập, không gửi dữ liệu về server.",
  "tools.notReady": "em chưa làm xong...",

  // ── JWT tool ──
  "jwt.description":
    "Giải mã, xác thực và mã hóa JSON Web Token ngay trên trình duyệt. Không gửi dữ liệu về máy chủ.",
  "jwt.secretPlaceholder": "Nhập secret key để xác thực...",
  "jwt.secretPlaceholderShort": "Nhập secret key...",
  "jwt.expStatus": "trạng thái (exp)",
  "jwt.expired": "Token đã hết hạn vào: ",
  "jwt.expiresAt": "Token sẽ hết hạn vào: ",

  // ── JSON Formatter tool ──
  "json.description":
    "Format, validate và so sánh JSON ngay trên trình duyệt. Hỗ trợ tự sửa lỗi cú pháp và xem cấu trúc dạng tree.",
  "json.invalid": "JSON không hợp lệ",
  "json.cantFix": "Không thể tự sửa được JSON này",
  "json.placeholder": "Dán JSON vào đây...",
  "json.placeholderA": "Dán JSON A vào đây...",
  "json.placeholderB": "Dán JSON B vào đây...",
  "json.autoFixed": "JSON đã được tự động sửa lỗi cú pháp.",
  "json.identical": "Hai JSON giống nhau hoàn toàn.",
  "json.outputHere": "output sẽ hiển thị ở đây",
  "json.treeHere": "tree sẽ hiển thị ở đây",
  "json.comparePlaceholder": "Dán JSON vào cả hai ô để so sánh tự động.",

  // ── Text Compare tool ──
  "textCompare.description":
    "So sánh hai đoạn văn bản — hiển thị khác biệt theo từng dòng.",
  "textCompare.placeholderA": "Dán văn bản gốc vào đây...",
  "textCompare.placeholderB": "Dán văn bản đã sửa vào đây...",
  "textCompare.identical": "Hai văn bản giống nhau hoàn toàn.",
  "textCompare.comparePlaceholder":
    "Dán văn bản vào cả hai ô để so sánh tự động.",
} as const;

export type TranslationKey = keyof typeof vi;
