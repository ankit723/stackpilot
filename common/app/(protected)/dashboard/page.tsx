'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserInfo } from "@/app/components/auth/user-info";
import { ExtendedUser } from "@/auth";

export default function DashboardPage() {
	const { data: session } = useSession();
	
	return (
		<div className="flex justify-center">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">Dashboard</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p className="text-center">Welcome {session?.user?.name}</p>
					<UserInfo user={session?.user as ExtendedUser} />
				</CardContent>
			</Card>
		</div>
	)
}