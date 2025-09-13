import { getServerSession } from "next-auth";
import { Geist, Geist_Mono } from "next/font/google";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    if (session.user.role != "บุคลากร") {
        redirect("/");
    }

    return <>{children}</>;
}
