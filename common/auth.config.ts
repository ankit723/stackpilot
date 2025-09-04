import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { LoginSchema } from "@/schema"

import type { NextAuthConfig } from "next-auth"
import { getUserByEmail } from "./data/user"
 
export default { providers: [
    Credentials({
        async authorize(credentials){
            const validatedFields = LoginSchema.safeParse(credentials);

            if (!validatedFields.success) {
                return null;
            }

            const { email, password } = validatedFields.data; 

            const user = await getUserByEmail(email);

            if (!user || !user.password ) {
                return null;
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return null;
            }

            return user;
        }
    }), 
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }), 
    Github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }) 
] } satisfies NextAuthConfig