"use client";

import Header from "@/components/header";
import NavBar from "@/components/navigations/nav-bar";
import { useState } from "react";
import JobMainSection from "./JobMain";

export default function JobDetail() {
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

                <div className="flex-1 bg-gray-100">
                    <JobMainSection />
                </div>
            </div>
        </div>
    );
}
