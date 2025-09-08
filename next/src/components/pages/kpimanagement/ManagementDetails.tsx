"use client";
import Header from "@/components/header";
import Sidebar from "@/components/navigations/nav-bar";
import SubNavBar from "@/components/navigations/sub-nav-bar";
import { useState } from "react";
import ManagementMain from "./ManagementMain";

export default function KpiTopicDetails() {
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
                <Header onMenuToggle={toggleMobileMenu} />
                <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
                {/* <SubNavBar /> */}

                <ManagementMain />
            </div>
        </div>
    );
}
