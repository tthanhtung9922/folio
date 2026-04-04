import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "ignored", "included")).toBe("base included");
  });

  it("tailwind-merge deduplicates conflicting utilities", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
