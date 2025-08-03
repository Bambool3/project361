import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            department: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: string;
        department: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        department: string;
    }
}
