'use client'

import { useState } from "react";
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Settings } from "@/app/actions/auth/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsSchema, SettingsSchemaType } from "@/schema"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormError } from "@/app/components/form-error";
import { FormSuccess } from "@/app/components/form-success";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
	const { user, signOut } = useCurrentUser();
    console.log(user)
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const form = useForm<SettingsSchemaType>({
		resolver: zodResolver(SettingsSchema),
		defaultValues: {
			name: user?.name || undefined,
            isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
            role: user?.role || undefined,
            email: user?.email || undefined,
            password: undefined,
            newPassword: undefined,
		},
	})

	const onSubmit = async (values: SettingsSchemaType) => {
		startTransition(async () => {
			const result = await Settings(values)
			if (result.error) {
				setError(result.error)
			} else {
				setSuccess(result.success || null)
			}
		})
	}

	return (
		<div className="flex justify-center">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">Settings</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Name" disabled={isPending} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
                                {!user?.isOAuth && (
                                    <FormField
                                        control={form.control}
                                        name="isTwoFactorEnabled"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Two Factor Authentication</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USER">User</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {!user?.isOAuth && (
                                    <>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Email" disabled={isPending} />
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
                                                        <Input {...field} placeholder="Password" disabled={isPending} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="New Password" disabled={isPending} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                            </div>
							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? "Updating..." : "Update Profile"}
							</Button>
                            {error && <FormError message={error} />}
                            {success && <FormSuccess message={success} />}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}