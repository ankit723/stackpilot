'use server';

import { SettingsSchemaType } from "@/schema";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getUserByEmail, getUserById } from "@/data/user";
import { revalidatePath } from "next/cache";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/token";
import { compare } from "bcryptjs";
import { hash } from "bcryptjs";

export const Settings = async (values : SettingsSchemaType) => {
    try {
        const user = await currentUser();
        if(!user) {
            return {error: "Unauthorized"}
        }
        const dbUser = await getUserById(user.id!);
        if(!dbUser) {
            return {error: "Unauthorized"}
        }

        if(values.email && values.email !== dbUser.email){
            const existingUser = await getUserByEmail(values.email);
            if(existingUser && existingUser.id !== dbUser.id) {
                return {error: "Email already in use"}
            }

            const verificationToken = await generateVerificationToken(values.email);
            await sendVerificationEmail(verificationToken.email, verificationToken.token);

            return {success: "Verification email sent"}
        }

        if(values.password && values.newPassword && dbUser.password){
            const isPasswordValid = await compare(values.password, dbUser.password);
            if(!isPasswordValid){
                return {error: "Invalid password"}
            }

            const hashedNewPassword = await hash(values.newPassword, 10);
            await db.user.update({
                where: {id: user.id!},
                data: {password: hashedNewPassword}
            })
            return {success: "Password updated successfully"}
        }

        await db.user.update({
            where: {id: user.id!},
            data: {
                ...values,
            }
        })
        revalidatePath("/settings");
        return {success: "Settings updated successfully"}
    } catch {
        return {error: "Internal server error"}
    }       
}
