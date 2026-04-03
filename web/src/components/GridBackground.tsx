export function GridBackground() {
  return (
    // z-[-1] để đảm bảo lớp nền này luôn nằm dưới cùng, không che mất chữ và nút bấm
    // pointer-events-none để chuột click xuyên qua nó
    <div className="pointer-events-none fixed inset-0 z-[-1] h-full w-full bg-background">
      {/* Lớp 1: Vẽ lưới kẻ ô (Grid) */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          // Dùng màu Parchment Border (#E4D8CC) để vẽ nét kẻ
          backgroundImage: `
            linear-gradient(to right, #E4D8CC 1px, transparent 1px),
            linear-gradient(to bottom, #E4D8CC 1px, transparent 1px)
          `,
          // Khoảng cách mỗi ô lưới là 32px (bội số của base unit 8px)
          backgroundSize: "32px 32px",
        }}
      />

      {/* Lớp 2: Hiệu ứng Mask (Mờ dần ra các góc) */}
      {/* Dùng màu Parchment (#FBF8F4) che phủ bớt lưới ở các cạnh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 20%, #FBF8F4 100%)",
        }}
      />
    </div>
  );
}
