"use client";
import Header from "@/components/header";
import Sidebar from "@/components/navigations/nav-bar";
import SubNavBar from "@/components/navigations/sub-nav-bar";
import { useState } from "react";

import KpiTopic from "@/client/components/KpiTopic";

export default function KpiTopicDetails() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState("KPIs");

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleNavItemClick = (itemName: string) => {
        setActiveNavItem(itemName);
        closeMobileMenu();
    };
    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <div className="flex flex-col h-screen">
                <Header
                    onMenuToggle={toggleMobileMenu}
                    isMobileMenuOpen={isMobileMenuOpen}
                />
                <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
                <KpiTopic/>
                {/* <MainContent /> */}
            </div>
        </div>
    );
}
