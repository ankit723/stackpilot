'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@/app/components/auth/user-button";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
	const pathname = usePathname();

	return (
		<nav className="bg-secondary flex justify-between items-center p-4 shadow-sm">
			<div className="flex gap-x-2">
				<Button 
					asChild 
					variant={pathname === "/dashboard" ? "default" : "outline"}
				>
					<Link href="/dashboard">
						Dashboard
					</Link>
				</Button>
				<Button 
					asChild 
					variant={pathname === "/admin" ? "default" : "outline"}
				>
					<Link href="/admin">
						Admin
					</Link>
				</Button>
				<Button 
					asChild 
					variant={pathname === "/settings" ? "default" : "outline"}
				>
					<Link href="/settings">
						Settings
					</Link>
				</Button>
			</div>
			<UserButton />
		</nav>
	);
}; 