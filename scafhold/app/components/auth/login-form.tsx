"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginSchemaType } from "@/schema";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation"; 
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { CardWrapper } from "./card-wrapper"
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/app/actions/auth/login";
import { Loader2 } from "lucide-react";


export const LoginForm = () => {
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error")==='OAuthAccountNotLinked'?"Email already in use with a different provider":null;

    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginSchemaType) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await login(data);
            console.log(result);
            if(result.twoFactor) {
                setShowTwoFactor(true);
            }
            else if (result.success) {
                setSuccess(result.success);
            } else {
                setError(result.error || "Something went wrong!");
            }
        });
    };

    return (
        <CardWrapper headerLabel="Welcome Back!" backButtonLabel="Don't have an account? Register here" backButtonHref="/auth/register" showSocial>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {showTwoFactor && (
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="123456" disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {!showTwoFactor && (
                        <>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="example@gmail.com" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" placeholder="********" disabled={isPending} />
                                        </FormControl>
                                        <Button variant="link" className="px-0 font-normal flex items-center justify-end" >
                                            <Link href="/auth/reset">Forgot password?</Link>
                                        </Button>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                    <FormError message={error || urlError || ""} />
                    <FormSuccess message={success || ""} /> 
                    <Button type="submit" className="w-full" disabled={isPending} data-loading={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : showTwoFactor ? "Verify" : "Login"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}