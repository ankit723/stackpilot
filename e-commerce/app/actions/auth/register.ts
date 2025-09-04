'use server';

import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { RegisterSchema, RegisterSchemaType } from "@/schema";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: RegisterSchemaType) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid form data!" };
    }

    const { name, email, password } = validatedFields.data;

    const user = await getUserByEmail(email);

    if (user) {
        return { error: "User already exists!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    // await signIn("credentials", {
    //     email,
    //     password,
    //     redirectTo: DEFAULT_LOGIN_REDIRECT,
    // });

    return {
        success: "Verification email sent!",
    }
}