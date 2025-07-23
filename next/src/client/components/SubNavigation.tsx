import { Plus, ChevronDown } from "lucide-react";

export default function SubNavigation() {
    return (
        <div className="bg-white border-b border-gray-200">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-6 h-12 overflow-x-auto">
                    <div className="flex items-center space-x-6 min-w-max">
                        <a href="#" className="flex items-center space-x-2 text-purple-600 border-b-2 border-purple-600 h-12 px-1">
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium whitespace-nowrap">Add a KPI</span>
                        </a>
                        {/* <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 h-12 px-1 transition-colors">
                            <span className="text-sm font-medium whitespace-nowrap">Generate KPIs</span>
                        </a> */}
                        {/* <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 h-12 px-1 transition-colors">
                            <span className="text-sm font-medium whitespace-nowrap">More Options</span>
                            <ChevronDown className="w-3 h-3" />
                        </a> */}
                    </div>
                </div>
            </div>
        </div>
    );
};