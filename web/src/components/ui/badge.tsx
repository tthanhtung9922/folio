import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded-xs font-mono",
  {
    variants: {
      variant: {
        // Terracotta accent — available, active, live
        available:
          "bg-terracotta/8 border-terracotta text-terracotta",
        // Muted — coming soon, disabled, draft
        soon:
          "border-ghost-ink/50 text-ghost-ink",
        // Verified / success state
        verified:
          "bg-terracotta/8 border-terracotta text-terracotta",
        // Error / invalid state
        error:
          "bg-terracotta-pale border-terracotta text-terracotta",
        // Neutral — informational, no strong state
        default:
          "border-parchment-border text-faded-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
