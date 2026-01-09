import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../services/authService';
import { Role, User, UserStatus, Doctor } from '../types';
import { CheckCircle, XCircle, Shield, Stethoscope, Search, MapPin, Loader2 } from 'lucide-react';

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setDoctors(allUsers.filter(u => u.role === Role.DOCTOR));
    setLoading(false);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    await updateUserStatus(userId, newStatus);
    loadDoctors();
  };

  const filteredDoctors = doctors.filter(doc => 
    activeTab === 'PENDING' 
      ? doc.status === UserStatus.PENDING 
      : doc.status !== UserStatus.PENDING
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
          <p className="text-slate-500">Verify registrations and manage practitioner accounts</p>
        </div>
        <div className="bg-white border border-slate-200 p-1 rounded-lg flex">
            <button 
                onClick={() => setActiveTab('PENDING')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Shield size={16} /> Pending Approval
            </button>
            <button 
                onClick={() => setActiveTab('ACTIVE')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Stethoscope size={16} /> Active Doctors
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {filteredDoctors.length > 0 ? (
               filteredDoctors.map(doc => {
                   const doctorData = doc as Doctor;
                   return (
                   <div key={doc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div className="flex items-start gap-4">
                           <img src={doc.avatar} alt={doc.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                           <div>
                               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                   {doc.name} 
                                   {doc.status === UserStatus.ACTIVE && <CheckCircle size={16} className="text-emerald-500" />}
                                   {doc.status === UserStatus.BLOCKED && <XCircle size={16} className="text-red-500" />}
                               </h3>
                               <p className="text-blue-600 font-medium text-sm mb-1">{doctorData.specialization}</p>
                               <div className="flex flex-col gap-1 text-xs text-slate-500">
                                   <span className="flex items-center gap-1"><Shield size={12}/> License: {doctorData.licenseNumber || 'N/A'}</span>
                                   <span className="flex items-center gap-1"><MapPin size={12}/> {doctorData.hospital}, {doctorData.location}</span>
                                   <span>Email: {doc.email}</span>
                               </div>
                           </div>
                       </div>
                       
                       <div className="flex gap-2 w-full md:w-auto">
                           {doc.status === UserStatus.PENDING && (
                               <>
                                <button 
                                    onClick={() => handleStatusChange(doc.id, UserStatus.ACTIVE)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(doc.id, UserStatus.BLOCKED)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                               </>
                           )}
                           
                           {doc.status === UserStatus.ACTIVE && (
                               <button 
                                    onClick={() => handleStatusChange(doc.id, UserStatus.BLOCKED)}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                               >
                                   Block Account
                               </button>
                           )}

                           {doc.status === UserStatus.BLOCKED && (
                               <button 
                                    onClick={() => handleStatusChange(doc.id, UserStatus.ACTIVE)}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                               >
                                   Re-Activate
                               </button>
                           )}
                       </div>
                   </div>
               )})
           ) : (
               <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                   No doctors found in this category.
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;