import { Crosshair, HelpCircle, ChevronDown, ExternalLink } from 'lucide-react';

interface AddKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
}
  
const AddKpiModal = ({ isOpen, onClose }: AddKpiModalProps) => {
    if (!isOpen) return null;
  
    return (
      // Backdrop
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        {/* Modal Panel */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add a KPI</h2>
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                Learn more
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
  
            {/* Form */}
            <div className="space-y-5">
              {/* KPI Name Input */}
              <div>
                <label htmlFor="kpi-name" className="sr-only">Give your KPI a name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="kpi-name"
                    placeholder="Give your KPI a name"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                    <Crosshair className="w-6 h-6" />
                  </div>
                </div>
              </div>
  
              {/* Target KPI Input */}
              <div>
                <label htmlFor="kpi-target" className="sr-only">Target KPI</label>
                <input
                  type="text"
                  id="kpi-target"
                  placeholder="Target KPI"
                  className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>
  
              {/* Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kpi-entry" className="block text-sm font-medium text-gray-700 mb-1">When will this KPI be entered?</label>
                  <div className="flex items-center gap-2">
                    <select id="kpi-entry" className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                    <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="kpi-format" className="block text-sm font-medium text-gray-700 mb-1">What is the Format?</label>
                   <div className="flex items-center gap-2">
                    <select id="kpi-format" className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white">
                      <option>1,234</option>
                      <option>$1,234.56</option>
                      <option>15%</option>
                    </select>
                    <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"/>
                  </div>
                </div>
              </div>
              
              {/* Accordions */}
              <div className="space-y-3">
                  <details className="bg-gray-50 p-4 rounded-lg cursor-pointer group">
                      <summary className="flex justify-between items-center font-medium text-gray-700 list-none">
                          More Options
                          <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform"/>
                      </summary>
                      <p className="text-gray-600 mt-3">More configuration options can be placed here, like setting deadlines or assigning owners.</p>
                  </details>
                  <details className="bg-gray-50 p-4 rounded-lg cursor-pointer group">
                      <summary className="flex justify-between items-center font-medium text-gray-700 list-none">
                          Create a formula
                          <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform"/>
                      </summary>
                      <p className="text-gray-600 mt-3">A formula builder or advanced calculation settings could be included in this section.</p>
                  </details>
              </div>
            </div>
          </div>
  
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row-reverse sm:items-center gap-3">
            <button className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
              Save
            </button>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default AddKpiModal;