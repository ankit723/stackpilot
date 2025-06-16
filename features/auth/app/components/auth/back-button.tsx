"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackButtonProps {
    label: string;
    href: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
    return (
        <Button variant="link" size="lg" className="w-full font-normal text-sm" asChild>
            <Link href={href}>{label}</Link>
        </Button>
    )
}