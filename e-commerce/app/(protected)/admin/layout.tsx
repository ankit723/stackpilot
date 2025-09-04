import { RoleGate } from "@/app/components/auth/role-gate";
import { Sidebar } from "@/app/components/sidebar";
import { UserRole } from "@prisma/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <RoleGate allowedRole={UserRole.ADMIN}>
                <Sidebar />
                <main className="flex-1 min-h-screen justify-center items-center ml-64">
                    {children}
                </main>
            </RoleGate>
        </div>
    )
}