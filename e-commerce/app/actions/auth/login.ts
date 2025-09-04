'use server';

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema, LoginSchemaType } from "@/schema";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

export const login = async (values: LoginSchemaType) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email or password!" };
    }

    const { email, password, code } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    
    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "User not found!" };
    }
    
    const isPasswordValid = await compare(password, existingUser?.password || "");

    if(!isPasswordValid) {
        return { error: "Invalid email or password!" };
    }

    if(!existingUser.emailVerified) {
        const token = await generateVerificationToken(email);
        await sendVerificationEmail(token.email, token.token);
        return { success: "Verification email sent!" };
    }

    if(existingUser.isTwoFactorEnabled && existingUser.email) {
        if(code){

            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

            if(!twoFactorToken) {
                return { error: "Invalid code!" };
            }

            if(twoFactorToken.token !== code) {
                return { error: "Invalid code!" };
            }

            if(twoFactorToken.expires < new Date()) {
                return { error: "Code expired!" };
            }
            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id },
            });

            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            if(existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id },
                });
            }
            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id,
                },
            });
        } else {
            const twoFactorToken = await generateTwoFactorToken(email);
            await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
            return { twoFactor: true };
        }
    }
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        });

        return { success: "Login successful!" };
    } catch (error)  {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }

        throw error; 
    }
    
}