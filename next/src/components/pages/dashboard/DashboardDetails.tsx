"use client";
import Header from "@/components/header";
import NavBar from "@/components/navigations/nav-bar";
import { useState } from "react";
import DashboardMain from "./DashboardMain";

export default function DashboardDetails() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <div className="flex flex-col h-screen">
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    <Header onMenuToggle={toggleMobileMenu} />
                    <NavBar
                        isOpen={isMobileMenuOpen}
                        onClose={closeMobileMenu}
                    />
                </div>

                {/* Main content */}
                <DashboardMain />
            </div>
        </div>
    );
}
