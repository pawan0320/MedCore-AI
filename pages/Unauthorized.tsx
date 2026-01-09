import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Lock className="w-12 h-12 text-slate-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-8">
        You do not have permission to access this resource. This area is restricted based on your user role.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
        >
          Go Back
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;