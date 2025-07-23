import { Menu, X, HelpCircle, UserCircle, NotepadText } from "lucide-react";

interface HeaderProps {
    onMenuToggle: () => void;
    isMobileMenuOpen: boolean;
}

const Header = ({ onMenuToggle, isMobileMenuOpen }: HeaderProps) => {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left section: Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        {/* Replace Icons.Logo with an actual Lucide icon, e.g., MenuIcon, or another suitable one */}
                        <NotepadText className="w-8 h-8 text-purple-600" />
                        <h1 className="text-xl font-bold text-gray-900">CMUPA</h1>
                    </div>
                    
                    {/* Right section: Subscription info and actions */}
                    <div className="flex items-center space-x-4">
                         <div className="hidden sm:flex items-center space-x-3">
                             {/* Your commented out subscription info */}
                         </div>
                         <div className="flex items-center space-x-1">
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                                <UserCircle className="w-5 h-5" />
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;