import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Database, Monitor, FileText, PieChart, Users, X, Settings } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;

}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {

    const pathname = usePathname()

    const navItems = [
        { name: 'KPIs', icon: LayoutGrid, path: '/dashboard' },
        { name: 'Data', icon: Database, path: '/data' },
        { name: 'Dashboards',icon: Monitor, path: '' },
        { name: 'Reports', icon: FileText, path: '' },
        { name: 'Analytics', icon: PieChart, path: '' },
        { name: 'Users', icon: Users, path: '' },
    ];


    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 bg-opacity-75 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <nav className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-purple-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Mobile header */}
                    <div className="flex items-center justify-between p-4 lg:hidden">
                        <div className="flex items-center space-x-3">
                            {/* You might want a better icon here for the title */}
                            <h1 className="text-lg font-bold text-white">CMUPA</h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-600"
                        >
                            <X />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 px-4 py-4 lg:py-0 lg:px-0">
                        <div className="lg:max-w-7xl lg:mx-auto lg:px-4 sm:lg:px-6 lg:lg:px-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:h-14 space-y-2 lg:space-y-0 lg:space-x-4">
                                {/* Main navigation links */}
                                <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2">
                                    {navItems.map(item => (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                pathname === item.path // Check against passed-in active state
                                                ? 'bg-white text-purple-700 shadow-sm'
                                                : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                                            }`}
                                            onClick={onClose} // Call the click handler
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span>{item.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Right-side icons - only show on desktop */}
                                <div className="hidden lg:flex items-center space-x-2">
                                    <button className="p-2 rounded-md text-purple-200 hover:bg-purple-600 hover:text-white transition-colors">
                                        <Settings />
                                    </button>
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                        A
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile bottom section */}
                    <div className="border-t border-purple-600 p-4 lg:hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                    A
                                </div>
                                <span className="text-sm font-medium text-white">Admin User</span>
                            </div>
                            <button className="p-2 rounded-md text-purple-200 hover:bg-purple-600 hover:text-white transition-colors">
                                <Settings />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
export default Sidebar;