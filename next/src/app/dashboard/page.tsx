'use client'

import Header from "../../client/components/Header"
import Sidebar from "../../client/components/Sidebar"
import SubNavigation from "../../client/components/SubNavigation"
import MainContent from "../../client/components/MainContent"
import { useState } from 'react';

export default function Page() { // Renamed to Page as it's a component
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState('KPIs'); // New state for active nav item

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleNavItemClick = (itemName: string) => {
        setActiveNavItem(itemName);
        closeMobileMenu(); // Close sidebar on mobile after clicking
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <div className="flex flex-col h-screen">
                <Header onMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen}/>
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                    activeNavItem={activeNavItem} // Pass active state
                    onNavItemClick={handleNavItemClick} // Pass click handler
                />
                <SubNavigation />

                <MainContent />
            </div>
        </div>
    );
}