import { RoleGate } from "@/app/components/auth/role-gate";
import { UserRole } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSuccess } from "@/app/components/form-success";

export default async function AdminPage() {
	return (
		<div className="flex min-h-screen justify-center items-center">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">Admin Page</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<RoleGate allowedRole={UserRole.ADMIN}>
						<FormSuccess message="You are authorized to access this page" />
					</RoleGate>
				</CardContent>
			</Card>
		</div>
	)
}