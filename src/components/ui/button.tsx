import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	// Base classes for all buttons
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
	{
		variants: {
			variant: {
				// Default glassy button: semi-transparent bg, blur, and a subtle border
				default:
					"bg-primary/80 text-primary-foreground border border-primary/90 backdrop-blur-2xl backdrop-saturate-150 hover:bg-primary",
				// Destructive variant with the same glass effect
				destructive:
					"bg-destructive/80 text-destructive-foreground border border-destructive/90 backdrop-blur-2xl backdrop-saturate-150 hover:bg-destructive",
				// Outline button with a transparent background that blurs content behind it
				outline:
					"border border-input bg-background/50 backdrop-blur-2xl backdrop-saturate-150 hover:bg-accent hover:text-accent-foreground",
				// Secondary variant with the glass effect
				secondary:
					"bg-secondary/80 text-secondary-foreground border border-secondary/90 backdrop-blur-2xl backdrop-saturate-150 hover:bg-secondary",
				// Ghost and Link variants remain unchanged for usability
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
