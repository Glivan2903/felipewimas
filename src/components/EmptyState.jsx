import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ message, actionText, actionRoute }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhum registro</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{message}</p>
      {actionRoute && actionText && (
        <button 
          onClick={() => navigate(actionRoute)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
