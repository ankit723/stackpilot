import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import authConfig from "./auth.config"
import { getUserById  } from "./data/user"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation"
import { db } from "./lib/db"
import { getAccountByUserId } from "./data/account"

export type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
}

declare module "next-auth"{
    interface Session{
        user: ExtendedUser;
    }
}

declare module "@auth/core/jwt"{
    interface JWT{
        role: UserRole;
        isTwoFactorEnabled: boolean;
        isOAuth: boolean;
    }
} 
 
const prisma = new PrismaClient()
 
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  }, 
  events: {
    async linkAccount({ user}){
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      })
    }
  },
  callbacks: {
    async signIn({ user, account}){
      if(account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user?.id as string);

      if(!existingUser) return false; 

      if(!existingUser.emailVerified) return false;

      if(existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if(!twoFactorConfirmation) return false;

        await db.twoFactorConfirmation.delete({
          where: {
            id: twoFactorConfirmation.id,
          },
        });

      };

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if(token.role && session.user){
        session.user.role = token.role;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      }

      if(token.name && session.user){
        session.user.name = token.name;
      }

      if(token.email && session.user){
        session.user.email = token.email;
      }

      if(token.role && session.user){
        session.user.role = token.role;
      }

      if(token.isOAuth && session.user){
        session.user.isOAuth = token.isOAuth;
      }

      return session;
    },
    async jwt({ token}) {
        if(!token.sub) return token;

        const existingUser = await getUserById(token.sub);

        if(!existingUser) return token;

        const existingAccount = await getAccountByUserId(existingUser.id);

        token.isOAuth = !!existingAccount;
        token.role = existingUser.role;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
        return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})