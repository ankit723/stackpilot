import { signOut, useSession } from "next-auth/react";

export const useCurrentUser = () => {
    const { data: session } = useSession();
    return {user: session?.user, signOut: signOut}
}