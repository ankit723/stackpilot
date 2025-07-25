'use server'

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    if(!existingToken) {
        return { error: "The token is invalid or has expired!" };
    }

    const user = await getUserByEmail(existingToken.email);

    if(!user) {
        return { error: "User not found!" };
    }

    await db.user.update({
        where: { id: user.id },
        data: { 
            emailVerified: new Date(),
            email: existingToken.email,
         },
    });

    await db.verificationToken.delete({
        where: { id: existingToken.id },
    });

    return { success: "Email verified successfully!" };
}