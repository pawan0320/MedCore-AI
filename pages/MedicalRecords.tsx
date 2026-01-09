import React, { useState } from 'react';
import { MOCK_RECORDS, MOCK_PRESCRIPTIONS } from '../services/mockData';
import { FileText, Download, Calendar, Activity, Pill, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'RECORDS' | 'PRESCRIPTIONS'>('RECORDS');

  // Filter based on role (Mocking logic since we don't have a real DB)
  // Patient sees their own. Doctor sees "Patient p1" for demo.
  const records = MOCK_RECORDS;
  const prescriptions = MOCK_PRESCRIPTIONS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">
               {user?.role === Role.DOCTOR ? 'Patient Records' : 'My Medical History'}
           </h1>
           <p className="text-slate-500">Securely managed Electronic Health Records (EHR)</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('RECORDS')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'RECORDS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
           >
             Reports & Labs
           </button>
           <button 
             onClick={() => setActiveTab('PRESCRIPTIONS')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'PRESCRIPTIONS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
           >
             Prescriptions
           </button>
        </div>
      </div>

      <div className="grid gap-4">
         {activeTab === 'RECORDS' && records.map((record) => (
             <div key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                 <div className="flex items-start gap-4">
                     <div className={`p-3 rounded-lg ${record.type === 'LAB_REPORT' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                         <FileText size={24} />
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-900">{record.title}</h3>
                         <p className="text-sm text-slate-500 mb-1">{record.summary}</p>
                         <div className="flex items-center gap-3 text-xs text-slate-400">
                             <span className="flex items-center gap-1"><Calendar size={12}/> {record.date}</span>
                             <span className="flex items-center gap-1"><User size={12}/> {record.doctorName}</span>
                         </div>
                     </div>
                 </div>
                 <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 text-sm font-medium">
                     <Download size={16} /> Download PDF
                 </button>
             </div>
         ))}

         {activeTab === 'PRESCRIPTIONS' && prescriptions.map((pres) => (
             <div key={pres.id} className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                             <Pill size={20} />
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900">Dr. {pres.doctorName}</h3>
                             <p className="text-xs text-slate-500">Prescribed on {pres.date}</p>
                         </div>
                     </div>
                     <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                         <Download size={16} /> Download
                     </button>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medications</h4>
                     <ul className="space-y-2">
                         {pres.medications.map((med, idx) => (
                             <li key={idx} className="flex justify-between text-sm">
                                 <span className="font-medium text-slate-800">{med.name} <span className="text-slate-400 text-xs">({med.dosage})</span></span>
                                 <span className="text-slate-500">{med.frequency}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
                 <p className="mt-3 text-sm text-slate-500 italic">
                     <span className="font-semibold">Note:</span> {pres.instructions}
                 </p>
             </div>
         ))}
      </div>
    </div>
  );
};

export default MedicalRecords;