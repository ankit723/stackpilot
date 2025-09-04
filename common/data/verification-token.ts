import { db } from "@/lib/db";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: {
                token: token,
                expires: {
                    gte: new Date(),
                },
            },
        });
        return verificationToken;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: {
                email,
                expires: {
                    gte: new Date(),
                },
            },
        });
        return verificationToken;
    } catch (error) {
        console.error(error);
        return null;
    }
};