"use client";
import React, { useState, useEffect, useRef, type ReactElement } from "react";
import { useTheme } from "next-themes"; // For theme toggling
import { Sun, Moon, Menu, X } from "lucide-react"; // Icons
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // For the Button component

export default function App(): ReactElement {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	// State to track scroll progress (0 to 1, where 1 means 100% of initial navbar height scrolled)
	const [scrollProgress, setScrollProgress] = useState(0);
	// Ref to get the DOM element of the navbar
	const navbarRef = useRef<HTMLElement>(null);
	// State to store the initial height of the navbar once it's rendered
	const [initialNavbarHeight, setInitialNavbarHeight] = useState(0);

	// Define initial and final (scrolled) pixel values for interpolation
	// (Assuming a base font-size of 16px for rem conversion)
	const INITIAL_NAV_TOP = 16; // Corresponds to Tailwind's 'top-4'
	const FINAL_NAV_TOP = 8; // Corresponds to Tailwind's 'top-2'

	const INITIAL_NAV_PADDING_Y = 16; // Corresponds to Tailwind's 'p-4' (vertical padding)
	const FINAL_NAV_PADDING_Y = 4; // Corresponds to Tailwind's 'py-1' (vertical padding)

	const INITIAL_LOGO_FONT_SIZE = 20; // Corresponds to Tailwind's 'text-xl'
	const FINAL_LOGO_FONT_SIZE = 14; // Corresponds to Tailwind's 'text-sm'

	const INITIAL_LOGO_PL = 0; // No padding-left initially
	const FINAL_LOGO_PL = 16; // Corresponds to Tailwind's 'pl-4' when scrolled

	// Close mobile menu when screen size changes to desktop
	useEffect(() => {
		const handleResize = () => {
			// If window width is 768px or more (md breakpoint) and mobile menu is open, close it.
			if (window.innerWidth >= 768 && mobileMenuOpen) {
				setMobileMenuOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [mobileMenuOpen]);

	// Effect to get the initial navbar height after component mounts
	// This is crucial for calculating scroll progress relative to its full height
	useEffect(() => {
		if (navbarRef.current && initialNavbarHeight === 0) {
			// Get the height when the navbar is in its initial, unscrolled state (p-4 padding)
			setInitialNavbarHeight(navbarRef.current.offsetHeight);
		}
	}, [initialNavbarHeight]); // Dependency ensures this runs once when height is not set

	// Effect to handle scroll events and update scrollProgress
	useEffect(() => {
		const handleScroll = () => {
			// Ensure initialNavbarHeight is set before calculating progress
			if (!initialNavbarHeight) return;

			const currentScrollY = window.scrollY;
			// Calculate progress: 0 when not scrolled, 1 when scrolled by initialNavbarHeight, capped at 1
			const progress = Math.min(1, currentScrollY / initialNavbarHeight);
			setScrollProgress(progress);
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Call once on mount to set initial state

		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [initialNavbarHeight]); // Recalculate if initialHeight changes (should be rare)

	// Interpolate values based on scrollProgress
	const currentNavTop =
		INITIAL_NAV_TOP - (INITIAL_NAV_TOP - FINAL_NAV_TOP) * scrollProgress;
	const currentNavPaddingY =
		INITIAL_NAV_PADDING_Y -
		(INITIAL_NAV_PADDING_Y - FINAL_NAV_PADDING_Y) * scrollProgress;
	const currentLogoFontSize =
		INITIAL_LOGO_FONT_SIZE -
		(INITIAL_LOGO_FONT_SIZE - FINAL_LOGO_FONT_SIZE) * scrollProgress;
	const currentLogoPL =
		INITIAL_LOGO_PL + (FINAL_LOGO_PL - INITIAL_LOGO_PL) * scrollProgress; // Add initial PL as it goes from 0 to 16

	const navLinks = [
		{ name: "Home", href: "#" },
		{ name: "Features", href: "#" },
		{ name: "Pricing", href: "#" },
		{ name: "Contact", href: "#" },
	];

	return (
		// Navbar container with glassmorphism styling and dynamic inline styles
		<nav
			ref={navbarRef} // Attach ref to the nav element
			className={cn(
				"fixed inset-x-0 z-50 shadow-xl backdrop-blur-2xl backdrop-saturate-150",
				"mx-auto w-[96%] max-w-7xl rounded-lg border border-border bg-card"
			)}
			style={{
				top: `${currentNavTop}px`,
				paddingTop: `${currentNavPaddingY}px`,
				paddingBottom: `${currentNavPaddingY}px`,
				// Horizontal padding remains constant as per p-4 / px-4 default
				paddingLeft: `16px`,
				paddingRight: `16px`,
				// Removed 'transition' property here for immediate style application on scroll
			}}
		>
			<div className="flex items-center justify-between">
				{/* Logo or Site Title */}
				<div className="flex-shrink-0">
					<a
						href="#"
						style={{
							fontSize: `${currentLogoFontSize}px`,
							paddingLeft: `${currentLogoPL}px`, // Apply interpolated padding-left
							// Removed 'transition' property here for immediate style application on scroll
						}}
						className="font-bold text-primary-foreground"
					>
						GTA Configs
					</a>
				</div>

				{/* Desktop Navigation Links */}
				<div className="hidden md:flex md:items-center md:space-x-8">
					{navLinks.map((link) => (
						<a
							key={link.name}
							href={link.href}
							className="text-foreground transition-colors duration-200 hover:text-accent-foreground"
						>
							{link.name}
						</a>
					))}
				</div>

				{/* Right side: Theme Toggle and Mobile Menu Button */}
				<div className="flex items-center space-x-4">
					{/* Theme Toggle Button using the new Button component with 'ghost' variant */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							setTheme(theme === "dark" ? "light" : "dark");
						}}
						aria-label="Toggle theme"
					>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>

					{/* Mobile Menu Button */}
					<button
						onClick={() => {
							setMobileMenuOpen(!mobileMenuOpen);
						}}
						className="rounded-full bg-secondary p-2 text-secondary-foreground transition-all duration-300 hover:bg-secondary-foreground hover:text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background md:hidden"
						aria-label="Toggle mobile menu"
					>
						{mobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu Content (conditionally rendered) */}
			{mobileMenuOpen && (
				<div className="animate-in slide-in-from-top-4 duration-300 ease-out md:hidden">
					<div className="mt-4 flex flex-col space-y-3 rounded-md border border-border bg-popover p-4 shadow-lg">
						{navLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								className="block text-foreground transition-colors duration-200 hover:text-accent-foreground"
								onClick={() => {
									setMobileMenuOpen(false);
								}} // Close menu on link click
							>
								{link.name}
							</a>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
