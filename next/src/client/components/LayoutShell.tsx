'use client';
//
import { usePathname } from "next/navigation";
//
import Header from "./Header"
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function LayoutShell({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    if (pathname.startsWith("/login")) {
        return <>{children}</>;
    }    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    
    // ฟังก์ชันสลับสถานะเมนูมือถือ (เปิด/ปิด)
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // ฟังก์ชันปิดเมนูมือถือ
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                onMenuToggle={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
            />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
