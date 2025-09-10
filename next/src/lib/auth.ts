import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                        include: {
                            user_roles: {
                                include: {
                                    role: true,
                                },
                            },
                            user_jobtitle: {
                                include: {
                                    jobtitle: true,
                                },
                            },
                        },
                    });

                    if (!user) {
                        throw new Error("อีเมลไม่ถูกต้อง");
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("รหัสผ่านไม่ถูกต้อง");
                    }

                    // Get the first role (you might want to handle multiple roles differently)
                    const userRole =
                        user.user_roles[0]?.role?.name || "No Role";
                    const userJobTitle =
                        user.user_jobtitle[0]?.jobtitle?.name || "No Job Title";

                    return {
                        id: user.user_id.toString(),
                        email: user.email,
                        name: `${user.first_name} ${user.last_name}`,
                        role: userRole,
                        department: userJobTitle, // Using job title as department for now
                    };
                } catch (error) {
                    // console.error("Auth error:", error);
                    throw error;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role as string;
                token.department = user.department as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
                session.user.department = token.department as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
