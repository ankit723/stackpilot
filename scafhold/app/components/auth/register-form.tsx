"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterSchemaType } from "@/schema";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { CardWrapper } from "./card-wrapper"
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { register } from "@/app/actions/auth/register";
import { Loader2 } from "lucide-react";

export const RegisterForm = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const form = useForm<RegisterSchemaType>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: RegisterSchemaType) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await register(data);
            if (result.success) {
                setSuccess(result.success);
                setIsDisabled(true);

            } else {
                setError(result.error || "Something went wrong!");
            }
        });
    };

    return (
        <CardWrapper headerLabel="Welcome! Please fill in the details to get started." backButtonLabel="Already have an account? Login here" backButtonHref="/auth/login" showSocial>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="John Doe" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="********" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormError message={error || ""} />
                    <FormSuccess message={success || ""} />
                    <Button type="submit" className="w-full" disabled={isPending || isDisabled} data-loading={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}