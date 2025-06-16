"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordSchema, NewPasswordSchemaType } from "@/schema";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { CardWrapper } from "./card-wrapper"
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { reset } from "@/app/actions/auth/reset";
import { Loader2 } from "lucide-react";
import { newPassword } from "@/app/actions/auth/new-password";


export const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    if (!token) {
        return <div>Invalid token!</div>;
    }

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDisabled, setIsDisabled] = useState(false);

    const form = useForm<NewPasswordSchemaType>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (data: NewPasswordSchemaType) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await newPassword(data, token);
            if (result.success) {
                setSuccess(result.success);
                setIsDisabled(true);
            } else {
                setError(result.error || "Something went wrong!");
            }
        });
    };

    return (
        <CardWrapper headerLabel="Forgot Your Password" backButtonLabel="Back to login" backButtonHref="/auth/login">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="********" type="password" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormError message={error || ""} />
                    <FormSuccess message={success || ""} /> 
                    <Button type="submit" className="w-full" disabled={isPending || isDisabled} data-loading={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}