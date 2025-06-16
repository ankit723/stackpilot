"use client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signIn } from "next-auth/react";

export const Social = () => {
    const handleClick = (provider: "google" | "github")=>{
        signIn(provider, {
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        });
    }
    return (
        <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
                handleClick("google");
            }}>
                <FcGoogle className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
                handleClick("github");
            }}>
                <FaGithub className="w-5 h-5" />
            </Button>
        </div>
    )
}