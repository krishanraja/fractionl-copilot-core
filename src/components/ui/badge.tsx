import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent text-white",
        success: "border-transparent text-white",
        warning: "border-transparent text-white",
        outline: "text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps & { style?: React.CSSProperties }) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case "default":
        return { background: "hsl(var(--primary))" }
      case "destructive":
        return { background: "hsl(var(--destructive))" }
      case "success":
        return { background: "hsl(var(--success))" }
      case "warning":
        return { background: "hsl(var(--warning))" }
      default:
        return {}
    }
  }

  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      style={{ ...getBackgroundStyle(), ...style }}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
