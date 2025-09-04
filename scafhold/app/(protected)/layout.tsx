import { Navbar } from "@/app/components/navbar";

interface ProtectedLayoutProps {
	children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="container mx-auto py-8">
				{children}
			</main>
		</div>
	);
} 