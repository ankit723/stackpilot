"use client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

export const UserButton = () => {
    const {user, signOut} = useCurrentUser();
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            <FaUser className="h-4 w-4 text-primary-foreground" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Button variant="ghost" onClick={()=>signOut()}>
                        <FaSignOutAlt className="h-4 w-4" />
                        Log out
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}