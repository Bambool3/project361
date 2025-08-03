'use client'
import KpiTable from "../../client/components/KpiTable";
export default function Page() {
    return(
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <div className="flex flex-col h-screen">
                <KpiTable />
            </div>
        </div>
    )
}