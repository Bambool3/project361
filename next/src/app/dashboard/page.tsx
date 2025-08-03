'use client'

import SubNavigation from "../../client/components/SubNavigation"
import MainContent from "../../client/components/MainContent"
export default function Page() { // Renamed to Page as it's a component
    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <div className="flex flex-col h-screen">
                <SubNavigation />
                <MainContent />
            </div>
        </div>
    );
}