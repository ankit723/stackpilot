'use server';

import { NewPasswordSchema } from "@/schema";

import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { NewPasswordSchemaType } from "@/schema";
import bcrypt from "bcryptjs";

export const newPassword = async (values: NewPasswordSchemaType, token: string) => {
    const validatedFields = NewPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid form data!" };
    }

    const { password } = validatedFields.data;

    const passwordResetToken = await getPasswordResetTokenByToken(token);

    if (!passwordResetToken) {
        return { error: "Invalid token!" };
    }

    const isExpired = passwordResetToken.expires < new Date();

    if (isExpired) {
        return { error: "Token expired!" };
    }

    const user = await getUserByEmail(passwordResetToken.email);

    if (!user) {
        return { error: "User not found!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
        where: { id: passwordResetToken.id },
    });

    return { success: "Password reset successfully!" };

}