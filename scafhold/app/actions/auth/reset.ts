'use server';

import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/token";
import { ResetSchema, ResetSchemaType } from "@/schema";

export const reset = async (data: ResetSchemaType) => {
    const validatedFields = ResetSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid form data!" };
    }

    const { email } = validatedFields.data;

    const user = await getUserByEmail(email);

    if (!user) {
        return { error: "User not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(user.email);

    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: "Reset email sent!" };    
}