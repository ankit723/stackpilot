import { UserRole } from "@prisma/client";
import * as z from "zod";

export const SettingsSchema = z.object({
    name: z.optional(z.string().min(1, {
        message: "Name is required",
    })),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.optional(z.nativeEnum(UserRole)),
    email: z.optional(z.string().email({
        message: "Invalid email address",
    })),
    password: z.optional(z.string().min(8, {
        message: "Password must be at least 8 characters",
    })),
    newPassword: z.optional(z.string().min(8, {
        message: "Password must be at least 8 characters",
    })),
})
.refine((data) => {
    if(data.password && !data.newPassword) {
        return false
    }
    return true;
}, {
    message: "New password is required",
    path: ["newPassword"],
})
.refine((data) => {
    if(data.newPassword && !data.password) {
        return false
    }
    return true;
}, {
    message: "Password is required",
    path: ["password"],
})

export const NewPasswordSchema = z.object({
    password: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
});

export const ResetSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
});

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
    code: z.optional(z.string().min(6, {
        message: "Code must be 6 characters",
    })),
});

export const RegisterSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
export type ResetSchemaType = z.infer<typeof ResetSchema>;
export type NewPasswordSchemaType = z.infer<typeof NewPasswordSchema>;
export type SettingsSchemaType = z.infer<typeof SettingsSchema>;