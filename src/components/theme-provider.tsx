"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactElement } from "react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>): ReactElement {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
