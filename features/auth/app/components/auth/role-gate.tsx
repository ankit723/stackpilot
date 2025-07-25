'use client';

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import { FormError } from "../form-error";

interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
    const currentRole = useCurrentRole();
    if(currentRole !== allowedRole) {
        return <FormError message="You are not authorized to access this page" />;
    }
    return <>{children}</>;
}